import net from 'net';
import stream from 'node:stream';

export interface TRxMsg {
    node: number;
    tx: number;
    rx: number;
}

export interface RouteMsg {
    node: number;
    target: number;
    hopcount: number;
    path: number[];
}

export class BackendConnection {
    private static instance: BackendConnection;

    static getInstance() {
        console.log(BackendConnection.instance);
        if (!BackendConnection.instance) 
            BackendConnection.instance = new BackendConnection();
        return BackendConnection.instance;
    }

    private readonly jsonIo = new JsonIoClient();
    public trxMsgHandler: (msg: TRxMsg) => void = (msg) => {
        console.log('No TRx handler', msg);
    };
    public routeMsgHandler: (msg: RouteMsg) => void = (msg) => {
        console.log('No Route handler', msg);
    };

    public isConnected = false;

    constructor() {
        this.jsonIo.onJsonRecv = (json) => {
            this.handleMsg(json);
        };
        this.jsonIo.onConnect = () => {
            console.log('Backend connected');
            this.isConnected = true;
        };
        this.jsonIo.onClose = () => {
            console.log('Backend disconnected');
            this.isConnected = false;
        };

        this.jsonIo.start();
        this.startHeartbeat();
    }

    private handleMsg(msg: object) {
        if (Object.prototype.hasOwnProperty.call(msg, "type")) {
            const typed = msg as { type: string };
            switch (typed.type) {
                case "TRx":
                    this.trxMsgHandler(msg as TRxMsg);
                    break;
                case "Status":
                    break;
                case "Route":
                    this.routeMsgHandler(msg as RouteMsg);
                    break;
                default:
                    console.log("Unknown message type from worker " + typed.type);
                    break;
            }
        }
    }

    public sendStart(nodeNum: number) {
        this.jsonIo.sendJsonTcp({
            type: "Start",
            nodenum: nodeNum
        });
    }

    public sendStop() {
        this.jsonIo.sendJsonTcp({
            type: "Stop"
        });
    }

    private async startHeartbeat() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.jsonIo.sendJsonTcp({
                type: "Status"
            });
        }
    }
    
}

class JsonIoClient {
    tcpClient = new TcpClient();
    streambuf = new stream.PassThrough();

    onJsonRecv: (json: object) => void = (d) => {
        console.log('No JSON handler', d);
    };
    onConnect: () => void = () => {
        console.log('JsonIoClient - Server connected');
    };
    onClose: () => void = () => {
        console.log('JsonIoClient - Server closed');
    }

    constructor() {
        this.tcpClient.onData = (data) => {
            this.recvDataCallback(data);
        };
        this.tcpClient.onConnect = () => {
            this.streambuf.read(); /* clear buffer */
            this.onConnect();
        }
        this.tcpClient.onClose = () => {
            this.onClose();
        }
    }

    start() {
        this.tcpClient.start();
    }

    sendJsonTcp(json: object) {
        const jsonstr = JSON.stringify(json);
        const buf = Buffer.alloc(2);
        buf.writeUInt16BE(jsonstr.length);

        this.tcpClient.send(buf);
        this.tcpClient.send(jsonstr);
    }

    recvDataCallback(data: Buffer) {
        const streambuf = this.streambuf;
        streambuf.write(data);

        while (streambuf.readableLength >= 2) {
            const buf = streambuf.read(2);
            const len = buf.readUInt16BE();
            if (streambuf.readableLength >= len) {
                try {
                    const json = JSON.parse(streambuf.read(len));
                    this.onJsonRecv(json);
                }
                catch (e) {
                    console.log('Fail to parse JSON');
                }
            } else {
                streambuf.unshift(buf);
                break;
            }
        }
    }
}

class TcpClient {
    socket: net.Socket = this.createSocket();
    serverAddr = '127.0.0.1';
    serverPort = 12123;
    onData: (data: Buffer) => void = (d) => {
        console.log('No data handler', d);
    };
    onConnect: () => void = () => {
        console.log('TcpClient - Server connected');
    };
    onClose: () => void = () => {
        console.log('TcpClient - Server closed');
    };

    constructor(serverAddr?: string, serverPort?: number) {
        if (serverAddr && serverPort) {
            this.serverAddr = serverAddr;
            this.serverPort = serverPort;
        }
    }

    createSocket() {
        const socket = new net.Socket();
        socket.setTimeout(3000);

        socket.on('timeout', () => {
            console.log('Socket Timeout');
            socket.destroy();
        });

        socket.on('data', (data) => {
            this.onData(data);
        });

        socket.on('error', (err) => {
            console.log('Socket Error: ' + err);
        });

        socket.on('close', () => {
            console.log('Connection closed...');
        });

        return socket;
    }

    send(data: Buffer | string) {
        if (!this.socket.closed)
            this.socket.write(data);
        else
            console.log('TCP not connected');
    }

    async start() {
        const socket = this.socket;
        const loop = true;
        while (loop) {
            if (socket.closed) {
                console.log('Try connect...');
                socket.removeAllListeners('connect');
                socket.connect(12123, '127.0.0.1', this.onConnect);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}
