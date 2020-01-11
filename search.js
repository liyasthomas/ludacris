const searchInput = $("#search-input");
const results = $("#results");
const apiUrl = "https://api.lyrics.ovh";
const lyricsDiv = $("#lyrics");
let timeoutSuggest;
lyricsDiv.hide();
searchInput.on("input", () => {
  if (timeoutSuggest) {
    clearTimeout(timeoutSuggest);
  }
  timeoutSuggest = setTimeout(suggestions, 300);
});

function removeResults() {
  $(".result").remove();
}

function suggestions() {
  const term = searchInput.val();
  if (!term) {
    removeResults();
    return;
  }
  $.getJSON(`${apiUrl}/suggest/${term}`, data => {
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
        title: title
      });
    });

    const l = finalResults.length;
    finalResults.forEach((result, i) => {
      let c = "result";
      if (i == l - 1) {
        c += " result-last";
      }
      const e = $(`<li class="${c}">${result.display}</li>`);
      results.append(e);
      e.click(() => {
        songLyrics(result);
      });
    });
  });
}

function songLyrics(song) {
  removeResults();
  lyricsDiv.slideUp();
  $.getJSON(`${apiUrl}/v1/${song.artist}/${song.title}`, ({ lyrics }) => {
    let html = `<h3 class="lyrics-title">${song.display}</h3>`;
    html += `<div id="thelyrics" class="thelyrics">${lyrics.replace(
      /\n/g,
      "<br />"
    )}</div>`;
    html +=
      '<div class="copy-lyrics" id="copy-lyrics" data-clipboard-target="#thelyrics">Copy the lyrics <span id="copy-ok"></span></div>';
    lyricsDiv.html(html);
    lyricsDiv.slideDown();
    const copyl = new Clipboard("#copy-lyrics");
    copyl.on("success", e => {
      e.clearSelection();
      $("#copy-ok").text(" - Done :-)");
    });
  });
}
