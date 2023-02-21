"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

async function storyFormSubmit(e) {
  e.preventDefault();
  $submitForm.attr('disabled', true)
  $submitForm.val('submitting...')
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  try {
    await storyList.addStory(currentUser, data);
    putStoriesOnPage();
    $author.val(''); $title.val(''); $storyUrl.val('');
    // alert('form submitted successfully')
    $submitForm.attr('disabled', false)
    $submitForm.val('Submit')
  }
  catch(e) {
    alert('Error:' + e)
  }
}

$newStoryForm.on('submit', storyFormSubmit)

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${returnFavIcon(story)}
      <i class="fa-trash fas"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
      <hr>
    `);
}

function returnFavIcon(story) {
    if (currentUser.favorites.some(e => e.storyId == story.storyId))
    return `<i class="fa-star fas"></i>`
    else return `<i class="fa-star far"></i>`
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// Gets list of favorites from current user, generate HTML, and puts on page, adopted from putStoriesOnPage

function putFavoritesOnPage() {

  $favoriteStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  if (!currentUser.favorites.length) $favoriteStoriesList.append(`<p> No favorites added yet! </p>`)
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStoriesList.append($story);
  }

  $favoriteStoriesList.show();
}

// Gets list of own Stories from current user, generate HTML, and puts on page, adopted from putStoriesOnPage


function putOwnStoriesOnPage() {

  $ownStoriesList.empty();
  if (!currentUser.ownStories.length) $ownStoriesList.append(`<p> No stories added yet! </p>`)

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $ownStoriesList.append($story);
  }
  $ownStoriesList.show();
}


$storiesContainer.on('click', 'i',handleFavesAndDelete)

async function handleFavesAndDelete(e) {
  $storiesContainer.off('click', 'i', handleFavesAndDelete)
  let list = e.currentTarget.classList
  let type = this.parentNode.parentNode
  if (list.contains('fa-trash')) {
    await storyList.removeStory(currentUser, e.target.parentElement.id)
    renderList(type)
    $storiesContainer.on('click', 'i', handleFavesAndDelete)
  }
  else if(list.contains('far')) {
    list.remove('far');
    list.add('fas');
    await User.addNewFavorite(currentUser.username, e.target.parentElement.id)
    renderList(type)
    $storiesContainer.on('click', 'i', handleFavesAndDelete)
  }
  else if (list.contains('fas')) {
    list.remove('fas');
    list.add('far');
    await User.removeFavorite(currentUser.username, e.target.parentElement.id)
    renderList(type);
    $storiesContainer.on('click', 'i', handleFavesAndDelete)
  }
}

function renderList(list) {
  if (list.id == 'all-stories-list')     putStoriesOnPage();
  if (list.id == 'favorite-stories-list')     putFavoritesOnPage();
  if (list.id == 'own-stories-list') putOwnStoriesOnPage();
}