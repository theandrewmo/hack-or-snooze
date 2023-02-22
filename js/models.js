"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    const newUrl = new URL(this.url)
    return newUrl.hostname
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    // UNIMPLEMENTED: complete this function!
      const response = await axios({
        url: `${BASE_URL}/stories`,
        method: "POST",
        data: {
          'token': user.loginToken, story: newStory
        }
      })
      const newOne = new Story(response.data.story)
      user.ownStories.unshift(newOne)
      storyList.stories.unshift(newOne)
  }

  async removeStory(user, oldStory) {
    try {
      const token = user.loginToken;
      const response = await axios({
        url: `${BASE_URL}/stories/${oldStory}`,
        method: "DELETE",
        data: {
          'token' : user.loginToken 
        }
      })
      const deletedOne = new Story(response.data.story)
      let x = (user.ownStories.findIndex(story => story.storyId == deletedOne.storyId))
      if (x !== -1) user.ownStories.splice(x , 1);
      let y = (storyList.stories.findIndex(story => story.storyId == deletedOne.storyId))
      if (y !== -1) storyList.stories.splice(y , 1);
      let z = (user.favorites.findIndex(story => story.storyId == deletedOne.storyId))
      if (z !== -1) user.favorites.splice(z , 1);
    }
    catch(e) {
      alert('Error:' + e)
    }
  }

  static async editStory(user, story, update) {
    try{
      const response = await axios({
        url: `${BASE_URL}/stories/${story}`,
        method: "PATCH",
        data: {
        'token' : user.loginToken,
        'story' : update
        }
      })
    } 
    catch(e) {
      alert(e.message)
    }
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  static async addNewFavorite(username, storyId) {
    const response = await axios({
      url: `${BASE_URL}/users/${username}/favorites/${storyId}`,
      method: "POST",
      data: { 'token' : currentUser.loginToken }
    })
    currentUser.favorites = response.data.user.favorites.map(s => new Story(s)) 
  }

  static async removeFavorite(username, storyId) {
    const response = await axios({
      url: `${BASE_URL}/users/${username}/favorites/${storyId}`,
      method: "DELETE",
      data: { 'token' : currentUser.loginToken }
    })
    currentUser.favorites = response.data.user.favorites.map(s => new Story(s))

  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    $loginButton.attr('disabled', true)

    try {
        const response = await axios({
        url: `${BASE_URL}/login`,
        method: "POST",
        data: { user: { username, password } },
      });

      let { user } = response.data;

      $loginButton.attr('disabled', false)

      return new User(
       {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
       response.data.token
      );
    }
    catch(e) {
      if (e.response.status == 404) {
        $loginUsername.css('border', '2px solid red')
        $incorrectUser.text(e.response.data.error.message);
      }
      else if (e.response.status == 401) {
        $loginPassword.css('border', '2px solid red')
        $incorrectPassword.text(e.response.data.error.message);
      }
      $loginButton.attr('disabled', false)
    }
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  static async getUser() {
    try {
      const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/?token=${currentUser.loginToken}`,
      method: "GET"
      });
      console.log(response)
    }

    catch(e) {
      console.log(e)
    }
  }

  static async updateName(name) {
    try {
      const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}`,
        method: "PATCH",
        data: {
          'token': currentUser.loginToken,
          "user": {
            "name": name
          }
        },
      });
      $profileName.text(response.data.user.name);
    }
    catch(e) {
      alert(e.message)
    }
    $newName.val('');
    $changeName.attr('disabled', false);
    $changeName.text('change name');
  }

  static async updatePassword(password) {
    try {
      const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}`,
        method: "PATCH",
        data: {
          'token': currentUser.loginToken,
          "user": {
            "password": password
          }
        },
      });
      alert('password successfully updated');
    }
    catch(e) {
      alert(e.message)
    }
    $newPassword.val('');
    $changePassword.attr('disabled', false);
    $changePassword.text('change password'); 
  }
}
