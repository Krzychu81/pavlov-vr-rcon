# Requirements
- Node: https://nodejs.org (tested with v10.15.3 and v12.18.2)

# Installation

Run commands
````
npm install
npx lerna bootstrap
````

# Starting
## Mac
Run command:
````
npm start
````

## Windows
Run command:
````
npm run start:win
````

## ... and then

In the console you should see:
````
backend: Listening on port 5000
...
frontend: Compiled successfully!
````

Once loaded go to http://localhost:3000.

On the Server page go to Configuration section and enter the following:

- Name (can be anything)
- IP of your RCON endpoint
- Password to your RCON endpoint (or leave it empty and enter hashed password instead)

and press submit. It will generate the hash and use that for connection.

Add some maps and then go to VR page. Enjoy!

# How to

## Add a map

Enter the steam64Id in the input box. E.g. for Mirage (https://steamcommunity.com/sharedfiles/filedetails/?id=1661803933) the steamId is 1661803933. Alternatively choose the default maps from the dropdown.

The loaded maps are stored in `/packages/backend/data/server-1.json`. As the files on the pavlov server are not modified, these maps are only for switching (they are not auto included in "map rotation").

# To-dos

- Authentication to be able to place the console on the server itself
- Ability to switch between the servers
- Use different port than 9100
- Fix retrieval of the names on the Players page
- Better error handling when connection to RCON fails (currently need to wait till all calls fail for the UI to be unblocked)

# License

[MIT](LICENSE)

