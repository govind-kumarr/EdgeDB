CREATE MIGRATION m1wohxqvsgtzexyxhcbqqmg6uovbklg7hduqnplsrxat6mgci6rb6q
    ONTO initial
{
  CREATE TYPE default::Asset {
      CREATE PROPERTY name: std::str;
  };
  CREATE TYPE default::Area {
      CREATE MULTI LINK assets: default::Asset;
      CREATE PROPERTY name: std::str;
  };
  CREATE TYPE default::Area_Cluster {
      CREATE MULTI LINK areas: default::Area;
      CREATE PROPERTY name: std::str;
  };
  ALTER TYPE default::Area {
      CREATE MULTI LINK area_clusters: default::Area_Cluster;
  };
  CREATE TYPE default::Zone {
      CREATE MULTI LINK areas: default::Area;
      CREATE PROPERTY name: std::str;
  };
  ALTER TYPE default::Area {
      CREATE LINK zone: default::Zone;
  };
  CREATE TYPE default::User {
      CREATE MULTI LINK assets: default::Asset;
      CREATE PROPERTY name: std::str;
  };
};
