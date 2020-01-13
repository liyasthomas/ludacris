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

function removeResults() {
  results.innerHTML = "";
}

function suggestions() {
  const term = searchInput.value;
  if (!term) {
    removeResults();
    return;
  }
  const request = new XMLHttpRequest();
  request.open("GET", `${apiUrl}/suggest/${term}`, true);
  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      const data = JSON.parse(this.response);
      removeResults();
      const finalResults = [];
      const seenResults = [];
      data.data.forEach(({ title, artist }) => {
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
    } else {
      // We reached our target server, but it returned an error
    }
  };
  request.onerror = () => {
    // There was a connection error of some sort
  };
  request.send();
}

function songLyrics({ artist, title, display }) {
  removeResults();
  const request = new XMLHttpRequest();
  request.open("GET", `${apiUrl}/v1/${artist}/${title}`, true);
  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      const { lyrics } = JSON.parse(this.response);
      let html = `<h3 class="lyrics-title">${display}</h3>`;
      html += `<div id="thelyrics" class="thelyrics">${lyrics.replace(
        /\n/g,
        "<br />"
      )}</div>`;
      lyricsDiv.innerHTML = html;
    } else {
      // We reached our target server, but it returned an error
    }
  };
  request.onerror = () => {
    // There was a connection error of some sort
  };
  request.send();
}
