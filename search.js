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
      data.forEach(({ title, artist }) => {
        if (seenResults.length >= 5) {
          return;
        }
        const t = `${title} - ${artist.name}`;
        if (seenResults.includes(t)) {
          return;
        }
        seenResults.push(t);
        finalResults.push({
          display: t,
          artist: artist.name,
          title
        });
      });
      const l = finalResults.length;
      finalResults.forEach((result, i) => {
        let c = "result";
        if (i == l - 1) {
          c += " result-last";
        }
        const e = document.createElement("li");
        e.innerHTML = `<li class="${c}">${result.display}</li>`;
        results.appendChild(e);
        e.addEventListener("click", () => {
          songLyrics(result);
        });
      });
    })
    .catch(error => {
      results.innerHTML = error;
    });
};

songLyrics = ({ artist, title, display }) => {
  removeResults();
  lyricsDiv.innerHTML = "Loading...";
  fetch(`${apiUrl}/v1/${artist}/${title}`)
    .then(response => response.json())
    .then(({ lyrics }) => {
      let html = `<h3 class="lyrics-title">${display}</h3>`;
      html += `<div id="thelyrics" class="thelyrics">${lyrics.replace(
        /\n/g,
        "<br />"
      )}</div>`;
      lyricsDiv.innerHTML = html;
    })
    .catch(error => {
      lyricsDiv.innerHTML = error;
    });
};
