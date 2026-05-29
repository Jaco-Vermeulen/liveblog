/**
 * Build timeline scorecard HTML from freetype meta.data (matches client_web2 editor).
 */
function scEscapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scPresetForVariant(variant) {
  if (variant === 'cricket') {
    return {
      minuteSuffix: false,
      showScorerStat: true,
      showBowlers: true,
      scorersLabel: 'Kolwers',
      bowlersLabel: 'Boulers',
    };
  }
  if (variant === 'custom') {
    return {
      minuteSuffix: false,
      showScorerStat: true,
      showBowlers: true,
      scorersLabel: 'Spelers',
      bowlersLabel: 'Boulers',
    };
  }
  return {
    minuteSuffix: true,
    showScorerStat: false,
    showBowlers: false,
    scorersLabel: 'Doelskoppe',
    bowlersLabel: 'Boulers',
  };
}

function scReadTeam(prefix, data) {
  var team = data[prefix] || {};
  var scorers = [];
  if (Array.isArray(team.scorers)) {
    team.scorers.forEach(function (row) {
      if (!row) return;
      scorers.push({
        name: String(row.name || '').trim(),
        minute: String(row.time != null ? row.time : row.minute || '').trim(),
        stat: String(row.stat != null ? row.stat : row.runs || '').trim(),
      });
    });
  }
  var bowlers = [];
  if (Array.isArray(team.bowlers)) {
    team.bowlers.forEach(function (row) {
      if (!row) return;
      bowlers.push({
        name: String(row.name || '').trim(),
        figures: String(row.figures != null ? row.figures : row.stats || '').trim(),
      });
    });
  }
  var extras = [];
  if (Array.isArray(team.extras)) {
    team.extras.forEach(function (row) {
      if (!row) return;
      var label = String(row.label || '').trim();
      var value = String(row.value || '').trim();
      if (label || value) extras.push({ label: label, value: value });
    });
  }
  var logo = '';
  if (team.img1 && team.img1.picture_url) {
    logo = String(team.img1.picture_url).trim();
  }
  return {
    name: String(team.name || '').trim(),
    score: String(team.score || '').trim(),
    logoUrl: logo,
    scorers: scorers,
    bowlers: bowlers,
    extras: extras,
  };
}

function scFormatDetail(scorer, minuteSuffix) {
  var detail = scorer.minute;
  if (!detail) return '–';
  return minuteSuffix ? scEscapeHtml(detail) + "'" : scEscapeHtml(detail);
}

function scRenderHomeScorerLi(s, minuteSuffix, showStat) {
  var min = scFormatDetail(s, minuteSuffix);
  var name = s.name ? scEscapeHtml(s.name) : '—';
  var statHtml = showStat
    ? '<span class="lb-scorecard-card__scorer-stat">' + (s.stat ? scEscapeHtml(s.stat) : '–') + '</span>'
    : '';
  return (
    '<li>' +
    statHtml +
    '<span class="lb-scorecard-card__scorer-min">' +
    min +
    '</span><span class="lb-scorecard-card__scorer-name">' +
    name +
    '</span></li>'
  );
}

function scRenderAwayScorerLi(s, minuteSuffix, showStat) {
  var min = scFormatDetail(s, minuteSuffix);
  var name = s.name ? scEscapeHtml(s.name) : '—';
  var statHtml = showStat
    ? '<span class="lb-scorecard-card__scorer-stat">' + (s.stat ? scEscapeHtml(s.stat) : '–') + '</span>'
    : '';
  return (
    '<li><span class="lb-scorecard-card__scorer-name">' +
    name +
    '</span><span class="lb-scorecard-card__scorer-min">' +
    min +
    '</span>' +
    statHtml +
    '</li>'
  );
}

function scRenderHomeBowlerLi(b) {
  var fig = b.figures ? scEscapeHtml(b.figures) : '–';
  var name = b.name ? scEscapeHtml(b.name) : '—';
  return (
    '<li><span class="lb-scorecard-card__scorer-min">' +
    fig +
    '</span><span class="lb-scorecard-card__scorer-name">' +
    name +
    '</span></li>'
  );
}

function scRenderAwayBowlerLi(b) {
  var fig = b.figures ? scEscapeHtml(b.figures) : '–';
  var name = b.name ? scEscapeHtml(b.name) : '—';
  return (
    '<li><span class="lb-scorecard-card__scorer-name">' +
    name +
    '</span><span class="lb-scorecard-card__scorer-min">' +
    fig +
    '</span></li>'
  );
}

function scRenderTeamExtras(team) {
  var rows = team.extras.filter(function (e) {
    return e.label || e.value;
  });
  if (!rows.length) return '';
  var items = rows
    .map(function (e) {
      return (
        '<li><span class="lb-scorecard-card__extra-label">' +
        scEscapeHtml(e.label || '—') +
        '</span><span class="lb-scorecard-card__extra-value">' +
        scEscapeHtml(e.value || '—') +
        '</span></li>'
      );
    })
    .join('');
  return '<ul class="lb-scorecard-card__team-extras">' + items + '</ul>';
}

function scReadBattingSide(raw) {
  return String(raw || '').trim() === 'away' ? 'away' : 'home';
}

function scReadSideDisplay(raw) {
  var v = String(raw || '').trim();
  if (v === 'batters' || v === 'bowlers' || v === 'both' || v === 'none') return v;
  return 'auto';
}

function scFormatCurrentOver(raw) {
  var value = String(raw || '').trim();
  if (!value) return '';
  if (/^over\b/i.test(value)) return value;
  return 'Over ' + value;
}

function scResolveTeamDisplay(side, variant, battingSide, homeSideDisplay, awaySideDisplay) {
  var mode = side === 'home' ? homeSideDisplay : awaySideDisplay;
  if (mode === 'batters') return { batters: true, bowlers: false };
  if (mode === 'bowlers') return { batters: false, bowlers: true };
  if (mode === 'both') return { batters: true, bowlers: true };
  if (mode === 'none') return { batters: false, bowlers: false };
  if (variant === 'rugby') return { batters: true, bowlers: false };
  if (side === battingSide) return { batters: true, bowlers: false };
  return { batters: false, bowlers: true };
}

function scUsesSplitPanel(variant, homeDisplay, awayDisplay) {
  if (variant === 'cricket') return true;
  if (variant !== 'custom') return false;
  return (
    (homeDisplay.batters && !homeDisplay.bowlers && awayDisplay.bowlers && !awayDisplay.batters) ||
    (awayDisplay.batters && !awayDisplay.bowlers && homeDisplay.bowlers && !homeDisplay.batters)
  );
}

function scRenderTeam(team, side, fallbackName, score, cricketLayout) {
  var name = team.name ? scEscapeHtml(team.name) : scEscapeHtml(fallbackName);
  var logo = team.logoUrl
    ? '<img src="' +
      scEscapeHtml(team.logoUrl) +
      '" alt="" class="lb-scorecard-card__logo" />'
    : '<div class="lb-scorecard-card__logo lb-scorecard-card__logo--placeholder" aria-hidden="true"></div>';
  var scoreHtml = cricketLayout
    ? '<span class="lb-scorecard-card__team-score">' + scEscapeHtml(score) + '</span>'
    : '';
  return (
    '<div class="lb-scorecard-card__team lb-scorecard-card__team--' +
    side +
    '">' +
    logo +
    '<span class="lb-scorecard-card__team-name">' +
    name +
    '</span>' +
    scoreHtml +
    scRenderTeamExtras(team) +
    '</div>'
  );
}

function scRenderSidePlayerList(side, batters, bowlers, display, minuteSuffix, showStat) {
  var parts = [];
  if (display.batters && batters.length) {
    var items = batters
      .map(function (s) {
        return side === 'home'
          ? scRenderHomeScorerLi(s, minuteSuffix, showStat)
          : scRenderAwayScorerLi(s, minuteSuffix, showStat);
      })
      .join('');
    parts.push(
      '<ul class="lb-scorecard-card__scorer-list" data-side="' +
        side +
        '" data-role="batters">' +
        items +
        '</ul>',
    );
  }
  if (display.bowlers && bowlers.length) {
    var bowlerItems = bowlers
      .map(function (b) {
        return side === 'home' ? scRenderHomeBowlerLi(b) : scRenderAwayBowlerLi(b);
      })
      .join('');
    parts.push(
      '<ul class="lb-scorecard-card__scorer-list" data-side="' +
        side +
        '" data-role="bowlers">' +
        bowlerItems +
        '</ul>',
    );
  }
  return parts.join('');
}

function buildScorecardHtmlFromMeta(data) {
  if (!data || typeof data !== 'object') return '';
  var home = scReadTeam('home', data);
  var away = scReadTeam('away', data);
  var match = data.match || {};
  var variant = match.variant ? String(match.variant).trim() : 'rugby';
  var preset = scPresetForVariant(variant);
  var bg = '';
  if (data.background && data.background.img && data.background.img.picture_url) {
    bg = String(data.background.img.picture_url).trim();
  }
  var homeScore = home.score || '0';
  var awayScore = away.score || '0';
  var status = match.quaters ? String(match.quaters).trim() : '';
  var currentOver = scFormatCurrentOver(match.current_over);
  var battingSide = scReadBattingSide(match.batting_side);
  var homeSideDisplay = scReadSideDisplay(match.home_side_display);
  var awaySideDisplay = scReadSideDisplay(match.away_side_display);
  var heading = match.scorers_label ? String(match.scorers_label).trim() : preset.scorersLabel;
  var bowlersHeading = match.bowlers_label ? String(match.bowlers_label).trim() : preset.bowlersLabel;
  var cricketLayout = variant === 'cricket';
  var cricketClass = cricketLayout ? ' lb-scorecard-card--cricket' : '';
  var bgClass = bg ? ' lb-scorecard-card--has-bg' : '';
  var bgStyle = bg ? ' style="background-image:url(' + scEscapeHtml(bg) + ')"' : '';

  var statusParts = [];
  if (currentOver) {
    statusParts.push(
      '<span class="lb-scorecard-card__current-over">' + scEscapeHtml(currentOver) + '</span>',
    );
  }
  if (status) {
    statusParts.push(
      '<span class="lb-scorecard-card__result-status">' + scEscapeHtml(status) + '</span>',
    );
  }
  var statusHtml = statusParts.length
    ? '<div class="lb-scorecard-card__result-meta">' + statusParts.join('') + '</div>'
    : '';

  var homeDisplay = scResolveTeamDisplay(
    'home',
    variant,
    battingSide,
    homeSideDisplay,
    awaySideDisplay,
  );
  var awayDisplay = scResolveTeamDisplay(
    'away',
    variant,
    battingSide,
    homeSideDisplay,
    awaySideDisplay,
  );
  var splitPanel = scUsesSplitPanel(variant, homeDisplay, awayDisplay);

  var homeScorers = home.scorers.filter(function (s) {
    return s.name || s.minute || s.stat;
  });
  var awayScorers = away.scorers.filter(function (s) {
    return s.name || s.minute || s.stat;
  });
  var homeBowlers = home.bowlers.filter(function (b) {
    return b.name || b.figures;
  });
  var awayBowlers = away.bowlers.filter(function (b) {
    return b.name || b.figures;
  });

  var homeHasPlayers =
    (homeDisplay.batters && homeScorers.length) || (homeDisplay.bowlers && homeBowlers.length);
  var awayHasPlayers =
    (awayDisplay.batters && awayScorers.length) || (awayDisplay.bowlers && awayBowlers.length);

  var playersBlock = '';
  if (splitPanel && (homeHasPlayers || awayHasPlayers)) {
    var homeHeading =
      homeDisplay.batters && !homeDisplay.bowlers
        ? heading
        : homeDisplay.bowlers && !homeDisplay.batters
          ? bowlersHeading
          : heading;
    var awayHeading =
      awayDisplay.batters && !awayDisplay.bowlers
        ? heading
        : awayDisplay.bowlers && !awayDisplay.batters
          ? bowlersHeading
          : bowlersHeading;
    var homeList = scRenderSidePlayerList(
      'home',
      homeScorers,
      homeBowlers,
      homeDisplay,
      preset.minuteSuffix,
      preset.showScorerStat,
    );
    var awayList = scRenderSidePlayerList(
      'away',
      awayScorers,
      awayBowlers,
      awayDisplay,
      preset.minuteSuffix,
      preset.showScorerStat,
    );
    playersBlock =
      '<div class="lb-scorecard-card__scorers-panel lb-scorecard-card__scorers-panel--split"><div class="lb-scorecard-card__scorers-row">' +
      (homeList
        ? '<div class="lb-scorecard-card__scorers-side" data-side="home"><p class="lb-scorecard-card__scorers-heading">' +
          scEscapeHtml(homeHeading) +
          '</p>' +
          homeList +
          '</div>'
        : '') +
      (awayList
        ? '<div class="lb-scorecard-card__scorers-side" data-side="away"><p class="lb-scorecard-card__scorers-heading">' +
          scEscapeHtml(awayHeading) +
          '</p>' +
          awayList +
          '</div>'
        : '') +
      '</div></div>';
  } else {
    var scorersBlock = '';
    if (
      (homeDisplay.batters && homeScorers.length) ||
      (awayDisplay.batters && awayScorers.length)
    ) {
      var homeList = homeDisplay.batters && homeScorers.length
        ? '<ul class="lb-scorecard-card__scorer-list" data-side="home">' +
          homeScorers
            .map(function (s) {
              return scRenderHomeScorerLi(s, preset.minuteSuffix, preset.showScorerStat);
            })
            .join('') +
          '</ul>'
        : '';
      var awayList = awayDisplay.batters && awayScorers.length
        ? '<ul class="lb-scorecard-card__scorer-list" data-side="away">' +
          awayScorers
            .map(function (s) {
              return scRenderAwayScorerLi(s, preset.minuteSuffix, preset.showScorerStat);
            })
            .join('') +
          '</ul>'
        : '';
      scorersBlock =
        '<div class="lb-scorecard-card__scorers-panel">' +
        '<p class="lb-scorecard-card__scorers-heading">' +
        scEscapeHtml(heading) +
        '</p><div class="lb-scorecard-card__scorers-row">' +
        homeList +
        awayList +
        '</div></div>';
    }

    var bowlersBlock = '';
    if (
      preset.showBowlers &&
      ((homeDisplay.bowlers && homeBowlers.length) || (awayDisplay.bowlers && awayBowlers.length))
    ) {
      var homeBList = homeDisplay.bowlers && homeBowlers.length
        ? '<ul class="lb-scorecard-card__scorer-list" data-side="home">' +
          homeBowlers.map(scRenderHomeBowlerLi).join('') +
          '</ul>'
        : '';
      var awayBList = awayDisplay.bowlers && awayBowlers.length
        ? '<ul class="lb-scorecard-card__scorer-list" data-side="away">' +
          awayBowlers.map(scRenderAwayBowlerLi).join('') +
          '</ul>'
        : '';
      bowlersBlock =
        '<div class="lb-scorecard-card__scorers-panel lb-scorecard-card__scorers-panel--bowlers">' +
        '<p class="lb-scorecard-card__scorers-heading">' +
        scEscapeHtml(bowlersHeading) +
        '</p><div class="lb-scorecard-card__scorers-row">' +
        homeBList +
        awayBList +
        '</div></div>';
    }
    playersBlock = scorersBlock + bowlersBlock;
  }

  var metaBlock = match.info
    ? '<footer class="lb-scorecard-card__meta"><p>' + scEscapeHtml(String(match.info)) + '</p></footer>'
    : '';

  var centerHtml;
  if (cricketLayout) {
    centerHtml =
      '<div class="lb-scorecard-card__result" aria-label="Telling ' +
      scEscapeHtml(homeScore) +
      ' teen ' +
      scEscapeHtml(awayScore) +
      '">' +
      statusHtml +
      '</div>';
  } else {
    centerHtml =
      '<div class="lb-scorecard-card__result" aria-label="Telling ' +
      scEscapeHtml(homeScore) +
      ' teen ' +
      scEscapeHtml(awayScore) +
      '">' +
      '<div class="lb-scorecard-card__result-scores"><span class="lb-scorecard-card__score">' +
      scEscapeHtml(homeScore) +
      '</span><span class="lb-scorecard-card__score-sep">-</span><span class="lb-scorecard-card__score">' +
      scEscapeHtml(awayScore) +
      '</span></div>' +
      statusHtml +
      '</div>';
  }

  return (
    '<div class="lb-scorecard-card' +
    cricketClass +
    bgClass +
    '"' +
    bgStyle +
    ' role="region" aria-label="Skoorbord">' +
    '<div class="lb-scorecard-card__overlay" aria-hidden="true"></div>' +
    '<div class="lb-scorecard-card__scoreline">' +
    scRenderTeam(home, 'home', 'Tuisspan', homeScore, cricketLayout) +
    centerHtml +
    scRenderTeam(away, 'away', 'Wêreldspan', awayScore, cricketLayout) +
    '</div>' +
    playersBlock +
    metaBlock +
    '</div>'
  );
}

function hydrateScorecardPost(post) {
  if (!post) return post;
  var items = [];
  if (post.mainItem && post.mainItem.item) items.push(post.mainItem.item);
  else if (post.items && post.items.length) {
    post.items.forEach(function (row) {
      if (row && row.item) items.push(row.item);
    });
  }
  if (post.groups && post.groups.length) {
    post.groups.forEach(function (group) {
      if (group && group.refs) {
        group.refs.forEach(function (ref) {
          if (ref && ref.item) items.push(ref.item);
        });
      }
    });
  }
  items.forEach(function (item) {
    if (
      item.item_type === 'Scorecard' &&
      item.meta &&
      item.meta.data &&
      typeof item.meta.data === 'object'
    ) {
      item.text = buildScorecardHtmlFromMeta(item.meta.data);
    }
  });
  return post;
}

module.exports = {
  buildScorecardHtmlFromMeta: buildScorecardHtmlFromMeta,
  hydrateScorecardPost: hydrateScorecardPost,
};
