import { RowDataPacket } from "mysql2";

interface IdOnly extends RowDataPacket {
    id: number
}

interface IPermissionsRow extends RowDataPacket {
    id: number,
    user_id: number,
    server_id: string
}

export type {IdOnly, IPermissionsRow};