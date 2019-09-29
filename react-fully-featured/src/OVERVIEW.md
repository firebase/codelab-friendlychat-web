*under construction

# potato (beta)

> "Be excellent to each other." ~ Bill S. Preston, Esq.

## concept

A simple chat app for a small group that can cherry-pick APIs and services and the ability to manage them in a way to serve the group's goal or purpose. Think of a fully interactive and customizable news feed, but also a communication channel in one.

> dev priorities (sorted; !exhaustive)
* data security and identity protection, (user permissions, tos, etc.)
* regulations & ethics
* client solution (basic understanding of user space and environment)
* industry best practices (declaritive, top-down data flow, idempotent operations)

## 2: state - context & auth

Consider a stripped down representation of two functions that live inside Potato's top-level context. Potato values a fully isolated authentication process which creates a redeemable session available when revisiting the site.

`onAuthStateChanged()` is a special listener inside the app's highest level context provider. It's tasked for handling all changes to the listener's callback, `user` - the auth state object which responds to a set of well-defined and comprehensive auth state changes, e.g., user chooses to identify with Google or identify with GitHub.

> *further development required, but should not have any effect on the following conclusions and observations
https://firebase.google.com/docs/auth/web/auth-state-persistence#modifying_the_auth_state_persistence

```javascript
// src/SessionProvider.js
componentDidMount() {
  . . .
  const unsubscribe = firebase.auth()
    .onAuthStateChanged(async user => {
      if (user != null) {
        const { providerData, ...rest } = user;
        . . .
        if (userConfig) {
          // initialize with existing user
          this.initializeApp();
        } else {
          // initialize with newly-created config fetched from cloud
          const payload = await api.createNewUser();
          this.initializeApp();
        }
      } else {
        firebase.auth().signOut();
      }
    });
};
```

```javascript
// src/SessionProvider.js
initializeApp = async () => {
  . . .
  // sequence of "blocked" async reduction towards initial state
  // considering memoization?
  this.setState({}, () => {
    // you're going to see these conditions throughout the app.
    // please practice building idempontent operations
    if (user) this.setListeners();
    if (user) this.initNotifications();
  });
};
```
In theory this approach limits to one redraw on initialization, and _only_ reacts to a healthy auth `state` object (by healthy I mean is well-formed or is null) which destructures down to the respective "global-like" context fields: `userConfig`,
`userConfigs`, `activeRoom`, `fcmToken`, `subscribedRooms`, `messages`, `user`.

> `fcmToken` and `user` will likely be cut in favor of a more secure approach. In fact, a revisit to _all_ levels of state is required to sniff out any adjacent sources of truth that have been overlooked.

There is some complexity that can be removed here, but the context's state redundancies that _will_ remain are minimal and the convenience has been worth it so far. The largest benefit is the help that it provides in avoiding "prop drilling" which ultimately limits the number of redraws throughout the DOM and further described in other sections. Makes for a cool cpu :)

## 2: state - application state consumption & efficiency strategies

The most frequently consumed resource is a message which are created via the standard .map() technique in any functional or class component.

>This is _potentially_ the most brittle part of the application, but also where Potato gets it's strength where it will [juice it or loose it](https://github.com/grapefrukt/juicy-breakout).

So far, limited precautions have been made to handle three distinct concepts regarding state: state, null, error. The list of these three "situations", for lack of a better word, are exhaustive and every component (and function if possible) must meet that criteria.

## 0: null

> Immediately I'd like to point out that the naming convention of Potato's context was poorly chosen by yours truly. Realistically speaking, I couldn't have chosen a worse name for the main context which brings me to my first observational claim.
**Potato's authentication state should remain completely out of any other state's lifecycle exclusively due to the fact that it is not "spawned" from that lifecycle process and only dude to that fact.**
If not, then somewhere in the n + 1 future your collection of enclosed lifecycle events (read "react app") will begin behaving in ways that are difficult to understand.

This was very alien to me at first, but then I noticed that this makes more room for juice. If we can allow the insertion of any list of JSX elements immediately when the component renders, then that gives you way more flexibility in keeping the user occupied as the client beautifully displays some loading animation or "prerendered?" state for example. I've tested these ideas using faker.js for easy data.

Have vision.
Have code.

##### todo
> notes on service worker
