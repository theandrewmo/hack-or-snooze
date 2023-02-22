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
      ${returnDeleteIcon(story)}
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

function returnDeleteIcon(story) {
  if (currentUser.ownStories.some(e => e.storyId == story.storyId))
    return `<i class="fa-trash fas"></i><i class="edit">     edit </i>`
  return ''
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

$storiesContainer.on('click', 'i', handleFavesAndDelete)
$storiesContainer.on('click', '.cancel', function() {
  $('#cancelEdit').remove();
  $storiesContainer.on('click', 'i', handleFavesAndDelete)
})

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
  else if (list.contains('edit')) {
    const div = document.createElement('div');
    div.id = 'cancelEdit'
    div.innerHTML = 
      `<section class = 'container' id="edit-story">
        <form action="">
          <select name="edits" id="edit" onchange='grabEdit(this)'>
            <option value="">-- Please choose an item to edit</option>
            <option value="author">author</option>
            <option value="title">title</option>
            <option value="url">url</option>
          </select>
        </form>
      </section>`
    e.currentTarget.parentNode.append(div);
  }
}

function renderList(type) {
  if (type.id == 'all-stories-list')  putStoriesOnPage();
  else if (type.id == 'favorite-stories-list')  putFavoritesOnPage();
  else if (type.id == 'own-stories-list') putOwnStoriesOnPage();
}

function grabEdit(obj) {
  const div = document.createElement('div');
  
  const storyId = (obj.parentElement.parentElement.parentElement.parentElement.id)
  $('#edit').attr('disabled', true);

  if(obj.value == 'author') {
    div.innerHTML = `
    <form action="" id=authUpdate>
    <label for="editAuth"></label>
    <input type="text" name="editAuth" id="editAuth" placeholder="new Author" required>
    <button>update</button>
    </form>
    <button class='cancel'>cancel</button>
    `
    $('#edit-story').append(div)

    $('#authUpdate').on('submit', async function(e) {
      e.preventDefault();
      const newVal = $('#editAuth').val();
      await StoryList.editStory(currentUser, storyId , {author:  newVal})
      $('#edit').attr('disabled', false);
      $('#cancelEdit').remove();
      $storiesContainer.on('click', 'i', handleFavesAndDelete)
      location.reload();
    })
  }

  else if(obj.value == 'title'){
    div.innerHTML = `
    <form action="" id="titleUpdate">
      <label for="editTitle"></label>
      <input type="text" name="editTitle" id="editTitle" placeholder="new Title" required>
      <button>update</button>
    </form>
    <button class='cancel'>cancel</button>
    `
    $('#edit-story').append(div)

    $('#titleUpdate').on('submit', async function(e) {
      e.preventDefault();
      const newVal = $('#editTitle').val();
      await StoryList.editStory(currentUser, storyId , {title:  newVal})
      $('#edit').attr('disabled', false);
      $('#cancelEdit').remove();
      $storiesContainer.on('click', 'i', handleFavesAndDelete)
      location.reload();
    })
  }

  else if(obj.value == 'url') {
    div.innerHTML = `
    <form action="" id='urlUpdate'>
      <label for=""></label>
      <input type="url" name="editUrl" id="editUrl" placeholder="new url" required>
      <button>update</button>
    </form>
    <button class='cancel'>cancel</button>
   `
   $('#edit-story').append(div)

    $('#urlUpdate').on('submit', async function(e) {
      e.preventDefault();
      const newVal = $('#editUrl').val();
      await StoryList.editStory(currentUser, storyId , {url:  newVal})
      $('#edit').attr('disabled', false);
      $('#cancelEdit').remove();
      $storiesContainer.on('click', 'i', handleFavesAndDelete)
      location.reload();
    })
  }
}


