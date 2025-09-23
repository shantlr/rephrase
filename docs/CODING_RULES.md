# Coding rules

Some generale coding rules to follow

## General

- Do not export type/values/functions when it is not required externally
- Avoid barrel files (e.g: index.ts) that simply re-export other files

## Typescript

- Prefer type to interface

#### Components

- inline callbacks when callback is used in a single place
- inline props typing instead of declaring an interface when possible
