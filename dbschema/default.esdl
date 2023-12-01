module default {
    type Area_Cluster {
        required name : str;
        multi areas: Area;
    }

    type Area {
        required name : str;
        zone: Zone;
        multi area_clusters: Area_Cluster;
        multi assets: Asset;
        area: Area;
    }

    type Zone {
        required name: str;
        multi areas: Area;
    }

    type Asset {
        required name: str;
    }

    type User {
        required name: str;
        multi assets: Asset;
        multi area_clusters: Area_Cluster;
    }
}
