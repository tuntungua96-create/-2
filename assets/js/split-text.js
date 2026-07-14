/*!
 * vanilla-split-text - 纯 JS 替代 GSAP SplitText
 */
function SplitText(el, options) {
  const type = options.type || 'chars';
  const charsClass = options.charsClass || '';
  const linesClass = options.linesClass || '';

  const result = { chars: [], words: [], lines: [] };
  const text = el.textContent.trim();
  el.innerHTML = '';

  const needsWords = type.includes('words');
  const needsChars = type.includes('chars');
  const needsLines = type.includes('lines');

  if (!needsChars && !needsWords) {
    el.textContent = text;
    return result;
  }

  const segments = text.split(/(\s+)/);

  segments.forEach(function(seg) {
    if (/^\s+$/.test(seg)) {
      el.appendChild(document.createTextNode(seg));
      return;
    }

    if (needsWords) {
      var wordEl = document.createElement('span');
      wordEl.style.display = 'inline-block';
      result.words.push(wordEl);

      if (needsChars) {
        for (var i = 0; i < seg.length; i++) {
          var charEl = document.createElement('span');
          charEl.textContent = seg[i];
          charEl.style.display = 'inline-block';
          if (charsClass) charEl.className = charsClass;
          result.chars.push(charEl);
          wordEl.appendChild(charEl);
        }
      } else {
        wordEl.textContent = seg;
      }
      el.appendChild(wordEl);
    } else if (needsChars) {
      for (var j = 0; j < seg.length; j++) {
        var cEl = document.createElement('span');
        cEl.textContent = seg[j];
        cEl.style.display = 'inline-block';
        if (charsClass) cEl.className = charsClass;
        result.chars.push(cEl);
        el.appendChild(cEl);
      }
    }
  });

  if (needsLines) {
    result.lines = [el];
    el.querySelectorAll('.' + (linesClass || 'split-line')).forEach(function(line) {
      result.lines.push(line);
    });
  }

  return result;
}