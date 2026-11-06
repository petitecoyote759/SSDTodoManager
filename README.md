# Setup

## Requirements
### Frontend
To run the frontend you will need npm, and to install required packages run:
```bash
npm install
``` 
in ```/ssd-todo-5724102/frontend```. To run in a development environment, run 

```bash
$ npm run dev
 ```

### Backend
To run the backend you will need python 3. It is recommended to setup a .venv, which will be shown below

#### .venv Setup
To create a virtual environment, go into `/ssd-todo-5724102/backend` and run:
```bash
$ python3 -m venv .venv 
```
This creates the virtual environment, to then activate it, on Linux:
```bash
$ source .venv/bin/activate
```
and on Windows:
```bash
$ .venv\Scripts\activate
```
#### Modules
To install the requirements, while in `/ssd-todo-5724102/backend`, run: 
```bash
$ pip install -r requirements.txt
```

#### .env
This program requires a .env in json format, an example is given in example.env, and it will also be given here. It should be located at `/ssd-todo-5724102/backend/.env`, containing:
```json
{
	"privateKey" : "aerhgsedfbgsdtbsethgawergsdfgsdfgertg",
	"signingKey": "aswaewrgaergsdfghdfxghdfthdfthfthfthththt"
}
```
Either create a file at `/ssd-todo-5724102/backend/.env`, or rename `example.env` to `.env`.


#### PostgreSQL
This program requires Postgres to be installed, if you do not have it installed, you can find it at 'https://www.postgresql.org/download/'.

To setup PostgreSQL, you will need to setup a database, and set that database name in `/ssd-todo-5724102/backend/config/database.ini`, then set your PostgreSQL username and password in that same file.

To create a database on Linux, use the psql tool.
```bash
$ sudo -u postgres psql -c "CREATE DATABASE databasename;"
```
Note that the database name will become all lowercase on creation.

To create the database on windows, you can use the command line by going to the program files or by using pgAdmin 4. To create it using the command line, go to `C:\Program Files\PostgreSQL\18\bin` (it may be a different number than 18, if it errors check that). Then run 
```bash
$ psql -U postgres -c "CREATE DATABASE databasename;"
```
Note that the database name will become all lowercase on creation.

If this doesn't work, use pgAdmin 4, and navigate to `Servers/PostgreSQL 18/Databases`, right click Databases and click Create->Database. Input a name in 'Database', and press Save.


Once setup, ensure that your `/ssd-todo-5724102/backend/config/database.ini` is updated with your information and database name.




#### Running
To run the backend, in `/ssd-todo-5724102/backend/` run 
```bash
$ python3 main.py
```





## How Reproduce Tests From Report
### Login/Register
When the app loads up, you can either create or login to an account.
To test creation, press register to switch to register mode, then input your username, email, and password. This will create a new account and log you into it. Since the JWT token automatically logs the user in, to test other users you will need to click on the profile in the bottom left and press logout.

To login, input your email and password that was previously used, if it is incorrect a message will appear saying that login failed.


### Misc  
To be able to create notes, you will first need to create a book. To do this, press the down arrow just below `search books...` in the bar on the left. Pressing that will open the create book menu, where you can input a book name and press create to create the book, it will be automatically selected.

To create a note, press the `+` in the top right, and to save press the `save` button next to it. You can drag the note around by grabbing the header bar, and you can change its colour by pressing the colour pallet button.

To create entries, press the down arrow at the bottom of the note and fill out the form. The date is not required.

### Task Status
Status defaults to Not Started (the red circle) on entry creation, you can change it by clicking on it and selecting a different value. Hovering over the status allows you to see a tooltip stating what the status is.

### Task Priority
Task priorities can be set in entry creation, or changed later.
To set it in entry creation, click on the priority area, which is by default labelled `0 - Low`, and select a new priority.
To change it later, click on the entry to select it, and then press `edit`. This allows you to change priority by pressing the up or down arrows on the right of the entry name.

### Task Descriptions
Task descriptions are by default not set. To edit a description open the entry by clicking on it, and then click on the description area. When there is no description, it will default to *"Click to add description..."*.

### Task Tags
Task tags can be added when editing an entry, done by clicking on the entry to open it, and then press `edit`. A `+ New Tag` area will appear below the entry name, pressing the button will open a menu to either add a tag to the entry, or create a new tag for your user. You can remove tags from an entry by clicking on them, and you can change their colour by clicking on the circle in the tag.

### Searching
Tasks can be searched via the search bar in the top. It searches tags, description, and entry name. Searches use regex, and anything that does not match the regex becomes gray.

### Due Dates
Due dates can be added by clicking the date button on the right of the `Due Date` section in the entry creation form.

### Dashboard
You can open the dashboard for a book by right clicking the book and pressing open dashboard. The dashboard can be moved around via dragging the top bar.


### JSON Exporting
To export a note as JSON, right click the note and press `Copy note`. This copies the note as JSON to the clipboard.

### Enumeration / API
To test enumeration and the rest of the API, you can use the `requests` module in python and make your own scripts to test the API.





