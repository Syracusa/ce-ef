import net from 'net';
import stream from 'node:stream';
import { AirvehicleManager } from './airvehicle-manager';
import { TrafficController } from './gui/traffic-controller';

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

/**
 * Perform TCP connection to backend simulation server
 * Singleton class(Use getInstance() to get instance)
 */
export class BackendConnection {
    /* Singleton */
    private static instance: BackendConnection;
    static getInstance() {
        console.log(BackendConnection.instance);
        if (!BackendConnection.instance)
            BackendConnection.instance = new BackendConnection();
        return BackendConnection.instance;
    }

    private readonly airvehicleManager = AirvehicleManager.getInstance();
    private readonly trafficController = TrafficController.getInstance();
    private readonly jsonIo = new JsonIoClient();

    private trxMsgHandler: (msg: TRxMsg) => void = (msg) => {
        // console.log('No TRx handler', msg);
    };

    private routeMsgHandler: (msg: RouteMsg) => void = (msg) => {
        console.log(msg);
        const node = this.airvehicleManager.avList[msg.node];
        
        const routeEntry = {
            hopCount: msg.hopcount,
            path: msg.path
        }; 
        
        node.updateRoutingTable(msg.target, routeEntry);
    };

    /** True if connected to backend simulation server */
    public isConnected = false;

    /** Do not use this constructor. Use getInstance() instead */
    constructor() {
        this.jsonIo.onJsonRecv = (json) => {
            this.handleMsg(json);
        };
        this.jsonIo.onConnect = () => {
            console.info('Backend connected');
            this.isConnected = true;
        };
        this.jsonIo.onClose = () => {
            console.info('Backend disconnected');
            this.isConnected = false;
        };

        this.jsonIo.start();
        this.startHeartbeat();
        this.startPeriodicNodeLinkStateSend();
        this.setTrafficControllerCallbacks();
    }

    /** Set callbacks for dummy traffic controll gui buttons */
    private setTrafficControllerCallbacks() {
        this.trafficController.createCallback = (confId) => {
            console.log("Create callback");
            this.jsonIo.sendJsonTcp({
                type: "NewDummyTrafficConf",
                confId: confId
            });
        };
        this.trafficController.deleteCallback = (confId) => {
            console.log("Delete callback");
            this.jsonIo.sendJsonTcp({
                type: "DeleteDummyTrafficConf",
                confId: confId
            });
        };
        this.trafficController.updateCallback = (confId, src, dst, pktsz, interval) => {
            console.log("Update callback");
            this.jsonIo.sendJsonTcp({
                type: "UpdateDummyTrafficConf",
                confId: confId,
                sourceNodeId: src,
                destinationNodeId: dst,
                packetSize: pktsz,
                intervalMs: interval
            });
        };
        this.trafficController.startCallback = (confId, src, dst, pktsz, interval) => {
            console.log("Start callback");
            this.jsonIo.sendJsonTcp({
                type: "StartDummyTraffic",
                confId: confId,
                sourceNodeId: src,
                destinationNodeId: dst,
                packetSize: pktsz,
                intervalMs: interval
            });
        };
        this.trafficController.stopCallback = (confId) => {
            console.log("Stop callback");
            this.jsonIo.sendJsonTcp({
                type: "StopDummyTraffic",
                confId: confId
            });
        };
    }

    /** Handle message from backend simulation server */
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
                    console.warn("Unknown message type from worker " + typed.type);
                    break;
            }
        }
    }

    /** Send strat message to backend simulation server */
    public sendStart(nodeNum: number) {
        this.jsonIo.sendJsonTcp({
            type: "Start",
            nodenum: nodeNum
        });
    }

    /** Send stop message to backend simulation server */
    public sendStop() {
        this.jsonIo.sendJsonTcp({
            type: "Stop"
        });
    }
    
    /** Periodically send link state message to backend simulation server(1s) */
    private async startPeriodicNodeLinkStateSend() {
        setInterval(() => {
            this.sendNodeLinkState();
        }, 1000);
    }

    /** Send link state message to backend simulation server */
    private sendNodeLinkState() {
        const nodenum = this.airvehicleManager.avList.length;
        const nodeLinkInfo: number[][] = [];
        for (let i = 0; i < nodenum; i++) {
            const oneNodeLinkInfo: number[] = [];
            for (let j = i + 1; j < nodenum; j++) {
                const pos1 = this.airvehicleManager.avList[i].getCurrentPosition();
                const pos2 = this.airvehicleManager.avList[j].getCurrentPosition();

                let distance = 10000 * 1000 * 1000; // 10000km default
                if (pos1 && pos2)
                    distance = pos1.distanceTo(pos2);
                oneNodeLinkInfo.push(parseFloat(distance.toFixed(2)));
            }
            nodeLinkInfo.push(oneNodeLinkInfo);
        }
        const json = {
            type: "LinkInfo",
            links: nodeLinkInfo
        }
        this.jsonIo.sendJsonTcp(json);
    }

    /** Periodically send heartbeat message to backend simulation server(1s) */
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
        console.warn('No JSON handler', d);
    };
    onConnect: () => void = () => {
        console.info('JsonIoClient - Server connected');
    };
    onClose: () => void = () => {
        console.info('JsonIoClient - Server closed');
    };

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
            console.error('Socket Timeout');
            socket.destroy();
        });

        socket.on('data', (data) => {
            this.onData(data);
        });

        socket.on('error', (err) => {
            console.error('Socket Error: ' + err);
        });

        socket.on('close', () => {
            console.warn('Connection closed...');
        });

        return socket;
    }

    send(data: Buffer | string) {
        if (!this.socket.closed)
            this.socket.write(data);
        else
            console.warn('TCP not connected. Message dropped');
    }

    /**
     * Connect to backend simulation server
     * Automatically reconnect when disconnected
     */
    async start() {
        const socket = this.socket;
        const loop = true;
        while (loop) {
            if (socket.closed) {
                console.info('Try connect...');
                socket.removeAllListeners('connect');
                socket.connect(12123, '127.0.0.1', this.onConnect);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}
