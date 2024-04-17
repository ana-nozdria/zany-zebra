Final project &ndash; A personal blogging system &ndash; Starter project
==========
This repository contains a starting point for your team's final project.

Your team should update this README to include the information required, as presented in the project handout available on Canvas.

a. A brief introduction to our webapp.

Welcome to the magical world of Zany Zebra. We created a blogging website that allows users to navigate without accounts, create accounts, create articles, edit them, chat with each other, leave comments, delete all their information (unlike SOME websites that say they let you do this but actually don't!!) and more.
Our blogging website has space for articles related to topics us (the devs) are passionate about: sports, parenting, gaming, gardening, and hiking (ask us how long it took to decide on those 5).
We are very proud of our work here, so please, go ahead and play with our baby, we hope you have fun.


b. A description of the extent to which your team has completed the compulsory features.

All compulsory features were completed to our satisfaction. We are confident the markers will agree.


c. A description of the extra features your team has implemented the extra features we implemented are:

- Search function:
A user can use our search modal to find articles that contain the word/words being searched in the title or author username. For the purposes of the assignment, we decided to search titles to make the search function easier to appreciate for a marker with limited time (the text of our articles is long, and so the results are less predictable). In a real-world application, our search function would likely be more inclusive (e.g., search the entire body of the articles)
- Comments:
Users can add comments to the articles. Only users who are logged in can create comments, but comments can be read by any user. Users can also reply to comments, which nests comments together. Users can delete their comments. All comments by a user are automatically deleted when the user deleted their account (this includes children comments of those comments, even if created by other users)
- Chat / Direct Messages:
We implemented socket.io to enable a live chat for logged in users. You will find instructions below on a way to test this feature.


d. Instructions on what the database file (*.db file) should be named:

We made no modification to the db name: project-database.db
Please remember to run the provided project-database-init-script.sql <3


e. Does the marker need to do anything prior to running your webapp, other than npm install?

YES. Please create an .env file in the root folder of the project containing the following line:
SESSION_SECRET=secret;


f. Does the marker need to do anything special to run your webapp, other than running npm start?
Only what is indicated in point e.


g. At least one username / password combination for an existing user in your system with some already-published articles.
Active usernames:

AndrewIChooseYou [recommended]
NuggetMaster [recommended]
LoveChickens88
SheikhCityLover99
BrainyMatriarch73
LoveZebras33
WittyWhiskers55

You can use the same password for all accounts: pa55word!

You can also create your own account and tailor your credential.


h. Any other instructions / comments you wish to make to your markers.

AD BLOCKERS: Please be aware that you will see error messages in your console in from TinyMCE if you use an adblocker (embedded or as an extension). This applies to the create article and edit article functions. If you would like to verify this is due to an adblocker, kindly turn it off or use a different browser and you will see the error message does not appear.
Note: these error messages in no way affect the functionality of the site.

A way to test the chat / DM function:
We found that by logging on with a credential (many provided in point g) in a regular browser, and opening an incognito/private browser window to log in with another, the chat feature can be tested in full.

Last comments: there were a couple of items our team was split on and had to solve with a vote. Of note:

- Comments order: We considered placing more recent comments at the top, as opposed to the bottom. The group decided to go with the implementation as you can see it in the project files (more recent comments added at the bottom, and children of a comment directly below it ordered with the same logic).

- Blog logo as home page button: The team had a discussion about how appropriate it is to use the logo as the home button. We voted and decided it is a trend that can be seen in many popular websites. So, we didn't implement a dedicated home button and instead trust the user to instinctively  click on the blog logo if they want to land on the homepage (tested it with family to good effect).
