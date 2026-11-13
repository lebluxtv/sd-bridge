import net from 'node:net';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
function arg(name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
}

const port = Number(arg('-port'));
const pluginUUID = arg('-pluginUUID');
const registerEvent = arg('-registerEvent');
let info = {};
try { info = JSON.parse(arg('-info') || '{}'); } catch {}

const binDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(binDir, '..');
const logDir = path.join(root, 'logs');
try { fs.mkdirSync(logDir, { recursive: true }); } catch {}
const logFile = path.join(logDir, 'sd-bridge.log');
const statusFile = path.join(root, 'runtime-status.json');
let pluginVersion = '<unavailable>';
try { pluginVersion = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8')).Version; } catch {}
let runtimeConnected = false;
let runtimeConfig = [];
function writeRuntimeStatus() {
  try {
    fs.writeFileSync(statusFile, JSON.stringify({
      pid: process.pid, version: pluginVersion, startedUtc: runtimeStartedUtc,
      updatedUtc: new Date().toISOString(), connected: runtimeConnected,
      profiles: runtimeConfig
    }, null, 2), 'utf8');
  } catch (err) { console.error(`SD Bridge runtime-status write failed: ${err}`); }
}
const runtimeStartedUtc = new Date().toISOString();
function log(level, msg) {
  const line = `${new Date().toISOString()} ${level.padEnd(5)} ${msg}`;
  try { fs.appendFileSync(logFile, line + '\n', 'utf8'); } catch {}
  if (level === 'ERROR') console.error(line); else console.log(line);
}

let config = { profiles: [] };
try {
  config = JSON.parse(fs.readFileSync(path.join(root, 'bridge-config.json'), 'utf8'));
} catch (e) {
  log('ERROR', `Cannot read bridge-config.json: ${e}`);
}
runtimeConfig = (config.profiles || []).map(p => ({ key: p.key, sdkProfile: p.sdkProfile }));
writeRuntimeStatus();

const devices = new Map();
for (const d of (info.devices || [])) {
  if (d && d.id) devices.set(d.id, { ...d, connected: true });
}

let socket = null;
let recvBuffer = Buffer.alloc(0);
let handshaken = false;
let handshakeKey = null;
let fragmentedOpcode = null;
let fragmentedPayloads = [];

function sendFrameText(text) {
  if (!socket || !handshaken) throw new Error('WebSocket not connected');
  const payload = Buffer.from(text, 'utf8');
  let header;
  if (payload.length < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = 0x80 | payload.length;
  } else if (payload.length <= 0xffff) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }
  const mask = crypto.randomBytes(4);
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i++) masked[i] = payload[i] ^ mask[i % 4];
  socket.write(Buffer.concat([header, mask, masked]));
}

function sendJson(obj) {
  const raw = JSON.stringify(obj);
  sendFrameText(raw);
  log('INFO', `SDK TX ${raw}`);
}

function sendControlFrame(opcode, payload = Buffer.alloc(0)) {
  if (!socket || !handshaken) return;
  const header = Buffer.alloc(payload.length < 126 ? 2 : 4);
  header[0] = 0x80 | opcode;
  if (payload.length < 126) {
    header[1] = 0x80 | payload.length;
  } else {
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  }
  const mask = crypto.randomBytes(4);
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i++) masked[i] = payload[i] ^ mask[i % 4];
  socket.write(Buffer.concat([header, mask, masked]));
}

function handleSdkMessage(raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }
  if (msg.event === 'deviceDidConnect' && msg.device) {
    devices.set(msg.device, { id: msg.device, ...(msg.deviceInfo || {}), connected: true });
    log('INFO', `Device connected ${msg.device} type=${msg.deviceInfo?.type}`);
  } else if (msg.event === 'deviceDidDisconnect' && msg.device) {
    const d = devices.get(msg.device) || { id: msg.device };
    d.connected = false;
    devices.set(msg.device, d);
    log('INFO', `Device disconnected ${msg.device}`);
  }
}

function handleDataFrame(opcode, fin, payload) {
  if (opcode === 0x1 && fin) {
    handleSdkMessage(payload.toString('utf8'));
    return;
  }
  if (opcode === 0x1 && !fin) {
    fragmentedOpcode = opcode;
    fragmentedPayloads = [payload];
    return;
  }
  if (opcode === 0x0 && fragmentedOpcode !== null) {
    fragmentedPayloads.push(payload);
    if (fin) {
      const combined = Buffer.concat(fragmentedPayloads);
      const originalOpcode = fragmentedOpcode;
      fragmentedOpcode = null;
      fragmentedPayloads = [];
      if (originalOpcode === 0x1) handleSdkMessage(combined.toString('utf8'));
    }
  }
}

function parseFrames() {
  while (recvBuffer.length >= 2) {
    const b0 = recvBuffer[0], b1 = recvBuffer[1];
    const fin = !!(b0 & 0x80);
    const opcode = b0 & 0x0f;
    const masked = !!(b1 & 0x80);
    let len = b1 & 0x7f;
    let off = 2;
    if (len === 126) {
      if (recvBuffer.length < 4) return;
      len = recvBuffer.readUInt16BE(2); off = 4;
    } else if (len === 127) {
      if (recvBuffer.length < 10) return;
      const big = recvBuffer.readBigUInt64BE(2);
      if (big > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Frame too large');
      len = Number(big); off = 10;
    }
    const maskLen = masked ? 4 : 0;
    if (recvBuffer.length < off + maskLen + len) return;
    let mask;
    if (masked) { mask = recvBuffer.subarray(off, off + 4); off += 4; }
    let payload = Buffer.from(recvBuffer.subarray(off, off + len));
    recvBuffer = recvBuffer.subarray(off + len);
    if (masked) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
    if (opcode === 0x1 || opcode === 0x0) handleDataFrame(opcode, fin, payload);
    else if (opcode === 0x8) { try { socket.end(); } catch {} return; }
    else if (opcode === 0x9) sendControlFrame(0xA, payload);
  }
}

function rejectHandshake(message) {
  log('ERROR', message);
  try { socket.destroy(); } catch {}
}

function onSocketData(chunk) {
  recvBuffer = Buffer.concat([recvBuffer, chunk]);
  if (!handshaken) {
    const marker = recvBuffer.indexOf('\r\n\r\n');
    if (marker < 0) return;
    const headerText = recvBuffer.subarray(0, marker + 4).toString('utf8');
    recvBuffer = recvBuffer.subarray(marker + 4);
    if (!/^HTTP\/1\.1 101 /m.test(headerText)) {
      rejectHandshake(`WebSocket handshake rejected: ${headerText.split('\r\n')[0]}`);
      return;
    }
    const expected = crypto.createHash('sha1')
      .update(handshakeKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
      .digest('base64');
    const m = headerText.match(/Sec-WebSocket-Accept:\s*(.+)\r\n/i);
    if (!m || m[1].trim() !== expected) {
      rejectHandshake('Invalid WebSocket handshake accept');
      return;
    }
    handshaken = true;
    runtimeConnected = true;
    writeRuntimeStatus();
    log('INFO', `Connected to Stream Deck SDK on port ${port}`);
    sendJson({ event: registerEvent, uuid: pluginUUID });
  }
  if (handshaken) parseFrames();
}

function connect() {
  if (!port || !pluginUUID || !registerEvent) {
    log('ERROR', 'Missing Stream Deck launch arguments');
    process.exit(1);
  }
  handshaken = false;
  fragmentedOpcode = null;
  fragmentedPayloads = [];
  recvBuffer = Buffer.alloc(0);
  handshakeKey = crypto.randomBytes(16).toString('base64');
  socket = net.createConnection({ host: '127.0.0.1', port }, () => {
    const req = [
      'GET / HTTP/1.1',
      `Host: 127.0.0.1:${port}`,
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Key: ${handshakeKey}`,
      'Sec-WebSocket-Version: 13',
      '', ''
    ].join('\r\n');
    socket.write(req);
  });
  socket.on('data', onSocketData);
  socket.on('error', e => log('ERROR', `Socket error: ${e}`));
  socket.on('close', () => {
    log('WARN', 'Stream Deck SDK socket closed; reconnecting');
    handshaken = false;
    runtimeConnected = false;
    writeRuntimeStatus();
    setTimeout(connect, 1000);
  });
}

function normalize(s) { return String(s || '').trim().toLowerCase(); }
function resolveProfile(command) {
  const wanted = normalize(command.profileKey || command.profile || command.name);
  if (!wanted && config.profiles.length === 1) return config.profiles[0];
  return config.profiles.find(p =>
    normalize(p.key) === wanted ||
    normalize(p.displayName) === wanted ||
    normalize(p.sourceName) === wanted ||
    (Array.isArray(p.aliases) && p.aliases.some(a => normalize(a) === wanted))
  );
}

function pickDevice(profile) {
  const connected = Array.from(devices.values()).filter(d => d.connected !== false);
  if (profile.deviceId) {
    const exact = connected.find(d => d.id === profile.deviceId);
    if (exact) return exact;
    log('ERROR', `Configured Stream Deck device is not connected: ${profile.deviceId}`);
    return null;
  }
  const matches = connected.filter(d => Number(d.type) === Number(profile.deviceType));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    log('ERROR', `Ambiguous Stream Deck target: ${matches.length} connected devices share required type=${profile.deviceType}. Disconnect one or configure a specific target in a future SD Bridge version.`);
  }
  return null;
}

function switchPage(command) {
  const p = resolveProfile(command);
  if (!p) return log('ERROR', `Unknown profile in command: ${command.profileKey || command.profile || ''}`);
  const page = Math.trunc(Number(command.page));
  if (!Number.isFinite(page) || page < 1) return log('ERROR', `Invalid page: ${command.page}`);
  const device = pickDevice(p);
  if (!device) {
    const connected = Array.from(devices.values())
      .filter(d => d.connected !== false)
      .map(d => `${d.id}:type=${d.type}`)
      .join(', ') || '<none>';
    return log('ERROR', `No unique connected Stream Deck matches required type=${p.deviceType}; connected=${connected}`);
  }
  const msg = {
    event: 'switchToProfile',
    context: pluginUUID,
    device: device.id,
    payload: { profile: p.sdkProfile, page: page - 1 }
  };
  try {
    sendJson(msg);
    log('INFO', `Switch requested profile=${p.displayName} key=${p.key} page=${page} device=${device.id}`);
  } catch (e) {
    log('ERROR', `Switch failed to send: ${e}`);
  }
}

const queueDir = path.join(os.tmpdir(), 'streamerbot-plugin-addon', 'queue');
const COMMAND_TTL_MS = 20000;
const MAX_FUTURE_SKEW_MS = 300000;
try { fs.mkdirSync(queueDir, { recursive: true }); } catch {}

function commandAgeMs(command, fullPath) {
  const t = Date.parse(command.createdUtc || '');
  if (Number.isFinite(t)) return Date.now() - t;
  try { return Date.now() - fs.statSync(fullPath).mtimeMs; } catch { return Number.POSITIVE_INFINITY; }
}

function pollCommands() {
  let files = [];
  try { files = fs.readdirSync(queueDir).filter(f => f.endsWith('.json')).sort(); } catch { return; }
  for (const file of files) {
    const full = path.join(queueDir, file);
    try {
      const raw = fs.readFileSync(full, 'utf8');
      try { fs.unlinkSync(full); } catch {}
      const command = JSON.parse(raw);
      const age = commandAgeMs(command, full);
      if (!Number.isFinite(age) || age > COMMAND_TTL_MS || age < -MAX_FUTURE_SKEW_MS) {
        log('WARN', `Discarded stale/invalid command ${file}; ageMs=${age}`);
        continue;
      }
      log('INFO', `Command RX ${raw}`);
      switchPage(command);
    } catch (e) {
      log('ERROR', `Command error ${file}: ${e}`);
      try { fs.unlinkSync(full); } catch {}
    }
  }
}

log('INFO', `SD Bridge starting uuid=${pluginUUID}`);
log('INFO', `Profiles=${config.profiles.map(p => `${p.key}:${p.sdkProfile}`).join(', ')}`);
connect();
setInterval(pollCommands, 100);
