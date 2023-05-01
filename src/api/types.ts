export type AllocationData = {
    object: "allocation",
    attributes: {
        id: number,
        ip: string,
        ip_alias: string|null,
        port: number,
        notes: string|null,
        is_default: boolean
    }
}

export type ServerData = {
    object: string,
    attributes: {
        server_owner: boolean,
        identifier: string,
        uuid: string,
        name: string,
        node: string,
        sftp_details: {
            ip: string,
            port: number
        },
        description: string,
        limits: {
            memory: number,
            swap: number,
            disk: number,
            io: number,
            cpu: number
        },
        feature_limits: {
            databases: number,
            allocations: number,
            backups: number
        },
        is_suspended: boolean,
        is_installing: boolean,
        relationships: {
            allocations: {
                object: "list",
                data: Array<AllocationData>
            }
        }
    }
}

export type List<X> = {
    object: "list",
    data: Array<X>,
    meta: {
        pagination: {
            total: number,
            count: number,
            per_page: number,
            current_page: number,
            total_pages: number,
            link: any
        }
    }
};