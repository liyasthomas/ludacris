const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
const apiUrl = "https://api.lyrics.ovh";
const lyricsDiv = document.getElementById("lyrics");
let timeoutSuggest;
searchInput.addEventListener("input", () => {
  if (timeoutSuggest) {
    clearTimeout(timeoutSuggest);
  }
  timeoutSuggest = setTimeout(suggestions, 300);
});

removeResults = () => {
  results.innerHTML = "";
};

suggestions = () => {
  const term = searchInput.value;
  if (!term) {
    removeResults();
    return;
  }
  results.innerHTML = "Loading...";
  fetch(`${apiUrl}/suggest/${term}`)
    .then(response => response.json())
    .then(({ data }) => {
      removeResults();
      const finalResults = [];
      const seenResults = [];
      data.forEach(({ title, artist, album }) => {
        if (seenResults.length >= 10) {
          return;
        }
        const t = `${title} - ${artist.name}`;
        if (seenResults.includes(t)) {
          return;
        }
        seenResults.push(t);
        finalResults.push({
          title,
          artist: artist.name,
          album: album.title,
          cover: album.cover_medium
        });
      });
      const l = finalResults.length;
      if (l) {
        finalResults.forEach((result, i) => {
          let c = "result";
          if (i == l - 1) {
            c += " result-last";
          }
          const e = document.createElement("li");
          e.innerHTML = `
          <li class="${c}">
            <img src="${result.cover}"> ${result.title} - ${result.artist}
          </li>
          `;
          results.appendChild(e);
          e.addEventListener("click", () => {
            songLyrics(result);
          });
        });
      } else {
        results.innerHTML = "No results";
      }
    })
    .catch(error => {
      results.innerHTML = error;
    });
};

songLyrics = song => {
  removeResults();
  lyricsDiv.innerHTML = "Loading...";
  fetch(`${apiUrl}/v1/${song.artist}/${song.title}`)
    .then(response => response.json())
    .then(({ lyrics }) => {
      let html = `
      <img src="${song.cover}">
      <h3 class="lyrics-title">
        ${song.title} - ${song.artist} (${song.album})
      </h3>`;
      html += `
      <div id="thelyrics" class="thelyrics">
        ${lyrics.replace(/\n/g, "<br />")}
      </div>
      `;
      lyricsDiv.innerHTML = html;
    })
    .catch(error => {
      lyricsDiv.innerHTML = "Not found";
    });
};
