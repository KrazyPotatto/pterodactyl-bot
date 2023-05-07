import type { IPermissionsRow, IdOnly } from './database-types';
import { database } from './database-manager';

async function hasPermission({userId, serverId}: {userId: string, serverId: string}): Promise<boolean> {
    let connection = await database();

    const [rows] = await connection.execute<IdOnly[]>('SELECT id FROM permissions WHERE user_id = ? AND server_id = ?', [userId, serverId]);
    return rows.length >= 1;
}

async function getUsersPermissions(userId: string): Promise<IPermissionsRow[]> {
    let connection = await database();

    const [rows] = await connection.execute<IPermissionsRow[]>('SELECT * FROM permissions WHERE user_id = ?', [userId]);
    return rows;
}

export {hasPermission, getUsersPermissions};