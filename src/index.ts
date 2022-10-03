import ModbusRTU from 'modbus-serial';

export default class IDM {
    client = new ModbusRTU();
    private IP: string;
    private PORT: number;
    private ID: number;

    constructor(IP: string, PORT?: number, ID?: number) {
        this.IP = IP;
        this.PORT = PORT ? PORT : 502;
        this.ID = ID ? ID : 1;
    }

    async connect() {
        await this.client.connectTCP(this.IP, { port: this.PORT });
        this.client.setID(this.ID);
    }

    async readFloatRegister(register: number) {
        const res = await this.client.readHoldingRegisters(register, 2)
        const buf = Buffer.allocUnsafe(4)
        buf.write(res.buffer.toString('hex').substring(4, 8) + res.buffer.toString('hex').substring(0, 4), 0, 4, 'hex')
        return buf.readFloatBE(0);
    }

    async writeFloatRegister(register: number, value: number) {
        const buf = Buffer.allocUnsafe(4)
        buf.writeFloatBE(value)
        const buf2 = Buffer.allocUnsafe(4)
        buf2.write(buf.toString('hex').substring(4, 8) + buf.toString('hex').substring(0, 4), 0, 4, 'hex')
        const res = await this.client.writeRegisters(register, buf2)
        return res;
    }

    async setPvSurplus(value: number) {
        return await this.writeFloatRegister(74, value);
    }

    async setHeatingElementPower(value: number) {
        return await this.writeFloatRegister(76, value);
    }

    async setPvPower(value: number) {
        return await this.writeFloatRegister(78, value);
    }

    async setHomeConsumption(value: number) {
        return await this.writeFloatRegister(82, value);
    }

    async setBatteryCharge(value: number) {
        return await this.writeFloatRegister(84, value);
    }

    async setBatteryLevel(value: number) {
        const buf = Buffer.allocUnsafe(2)
        buf.writeIntBE(value, 0, 2)
        return await this.client.writeRegisters(86, buf)
    }

};
