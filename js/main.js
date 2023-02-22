"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $favoriteStoriesList = $('#favorite-stories-list')
const $ownStoriesList = $('#own-stories-list')

const $storiesContainer = $('.stories-container')

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $loginUsername = $('#login-username');
const $loginPassword = $('#login-password');
const $loginButton = $('#login-button');
const $incorrectUser = $('#incorrect-user');
const $incorrectPassword = $('#incorrect-password');

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $userProfile = $('#user-profile');
const $profileName = $('#profile-name');
const $profilePassword = $('#profile-password')
const $newName = $('#new-name');
const $newPassword = $('#new-password');
const $changeName = $('#change-name');
const $changePassword = $('#change-password');

const $navSubmit = $('#nav-submit');
const $navFavorites = $('#nav-favorites');
const $navMyStories = $('#nav-my-stories');

const $newStoryForm = $('#new-story-form');
const $author = $('#author');
const $title = $('#title');
const $storyUrl = $('#storyUrl');
const $submitForm = $('#submit-form')


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $newStoryForm,
    $favoriteStoriesList,
    $ownStoriesList,
    $userProfile,
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
