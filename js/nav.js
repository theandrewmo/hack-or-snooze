"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  if (currentUser) putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  navAllStories();
}

// show form to submit new story when user clicks 'submit' nav link

function navDisplayForm() {
    hidePageComponents();
    if(currentUser) {
      $allStoriesList.show();
      $newStoryForm.show();
    }   
}

$navSubmit.on('click', navDisplayForm)

// show user favorites when user clicks 'favorites' nav link

function navDisplayFavorites() {
  hidePageComponents();
  if (currentUser) putFavoritesOnPage()
}

$navFavorites.on('click', navDisplayFavorites)

// show only users own stories when user clicks 'my stories' nav link

function navDisplayMyStories() {
  hidePageComponents();
  if(currentUser) putOwnStoriesOnPage()
}

$navMyStories.on('click', navDisplayMyStories)