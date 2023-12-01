CREATE MIGRATION m1xodcny75jt5m5lrrljsvoj63qwoxej26wgelkopk52slry32b3wq
    ONTO m1chlo7pfskxesdq6ga334f56aka7n5mwxmvhulldxziynwi3qdlgq
{
  ALTER TYPE default::Asset {
      DROP PROPERTY test;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK area_clusters: default::Area_Cluster;
  };
};
