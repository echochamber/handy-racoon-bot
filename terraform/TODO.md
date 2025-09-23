

## Immediately


### Bugs

* [x] Fix empty description failing to create.
### Infra Setup

* [x] Local Hello World version working.
* [x] Initial Deployed hello world working.
* [x] Deploy to cloud functions using terraform.
* [x] `npm start` and `npm run dev` both work so it handles running cloud functions and locally
  correctly.
* [x] Create second dev bot for localdev testing. 
* [x] modulize and environmentize terraform configs for each env.
* [x] Update GCP function to use typescript compiler
* [x] Set up read/write to firebase.

### Features

* [x] Create data model for players, characters, items, attunements
* [x] Command for adding new items to a character
* [x] Command for removing items from a character
* [x] Command for transfering items between characters
* [x] Command for attune & unattune.
  * [x] If attempting to attune with 3 already attuned, provide player with list of attuned items to
    select which to unattune as well as a "cancel" option.
* [ ] Keep a map of discordId to default selected character, and set that as the default value in
  character selectors.
* [x] Make last message of an info command not ephemeral? Or add a button to display result in chat.

## Eventually:

### BUGS

* [ ] I don't think `"start": "functions-framework --target=TypescriptFunction",` is being used or
  even works.


### Infra Improvements
* [ ] Configure logging more sanely.
* [ ] Update terraform not to create a bucket for each env. Provide it externally as a shared dep.
* [ ] Github webhook to automatically build on pull request open.
* [x] Refactor to be idiomatic typescript instead of js.
* [ ] Auth end user based on discord creds of some sort.
* [x] prod .env file stored in GCP secret manager.
* [x] Pull .env file from GCP secret manager in build process on cloud build.
* [ ] Script for updating GCP secrets so I don't need to use UI.
* [x] Improve terraform apply speed/performance.
  * Not really possible with cloud functions, floor on deploy time is > 60s.
  using local creds.
* [x] Setup bundler so I can use @/ imports.
* [x] Set up service account with lower permission scopes for running discord bot cloud functions.

### Features

* [x] Figure out how to handle stashed items and expended items in data model.
* [ ] Add history of item transfers.
* [ ] Start session command and end session command to track events that happen during a session.
    * Start session command takes attendnance list (checkbox of players and their current characters
      in the UI)
    * End session command takes a summary?





### Dev Nice to Have

* [ ] Local