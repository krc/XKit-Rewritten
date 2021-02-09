(function () {
  let reblogSelector;

  let trimAdditions;
  let trimRebloggedCommentary;

  const excludeClass = 'xkit-condensed-reblogs-done';
  const reblogClass = 'xkit-condensed-reblogs-reblog';
  const contextItemClass = 'xkit-condensed-reblogs-context';

  const expandButton = Object.assign(document.createElement('button'), { className: 'xkit-condensed-reblogs-expand' });
  const onExpandButtonClick = ({ target }) => target.parentNode.removeChild(target);

  const processPosts = async function () {
    const { getPostElements } = await fakeImport('/util/interface.js');

    getPostElements({ excludeClass }).forEach(async postElement => {
      const reblogs = [...postElement.querySelectorAll(reblogSelector)];
      if (reblogs.length < 2) { return; }

      reblogs.forEach(async reblog => reblog.classList.add(reblogClass));

      const contributedContent = postElement.querySelector('[data-is-contributed-content]');
      const firstReblog = reblogs[0];

      const expandButtonClone = expandButton.cloneNode(true);
      expandButtonClone.addEventListener('click', onExpandButtonClick);

      if (contributedContent !== null && trimAdditions) {
        const contextItem = contributedContent.previousElementSibling;
        if (contextItem !== firstReblog) {
          contextItem.classList.add(contextItemClass);
          firstReblog.parentNode.insertBefore(expandButtonClone, firstReblog);
        }
      } else if (contributedContent === null && trimRebloggedCommentary) {
        firstReblog.parentNode.insertBefore(expandButtonClone, firstReblog.nextElementSibling);
      }
    });
  };

  const main = async function () {
    const { getPreferences } = await fakeImport('/util/preferences.js');
    const { keyToCss } = await fakeImport('/util/css_map.js');
    const { translate } = await fakeImport('/util/language_data.js');
    const { onNewPosts } = await fakeImport('/util/mutations.js');

    ({ trimAdditions, trimRebloggedCommentary } = await getPreferences('condensed_reblogs'));

    reblogSelector = await keyToCss('reblog');

    expandButton.textContent = await translate('Put reblogs back');

    onNewPosts.addListener(processPosts);
    processPosts();
  };

  const clean = async function () {
    const { onNewPosts } = await fakeImport('/util/mutations.js');
    onNewPosts.removeListener(processPosts);

    $('.xkit-condensed-reblogs-expand').remove();

    $(`.${excludeClass}`).removeClass(excludeClass);
    $(`.${reblogClass}`).removeClass(reblogClass);
    $(`.${contextItemClass}`).removeClass(contextItemClass);
  };

  return { main, clean, stylesheet: true, autoRestart: true };
})();