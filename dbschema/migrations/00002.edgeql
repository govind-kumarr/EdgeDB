CREATE MIGRATION m1chlo7pfskxesdq6ga334f56aka7n5mwxmvhulldxziynwi3qdlgq
    ONTO m1wohxqvsgtzexyxhcbqqmg6uovbklg7hduqnplsrxat6mgci6rb6q
{
  ALTER TYPE default::Asset {
      CREATE PROPERTY test: array<std::str>;
  };
};
