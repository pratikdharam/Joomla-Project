<?php
use Joomla\CMS\Uri\Uri;
if (!$displayData['author']) return;
$authorParams = json_decode($displayData['author']->params);
$proParams = $displayData['author']->profile;
$fields = $displayData['author']->fields;
$author_link = !empty($displayData['link']) ? $displayData['link'] : "";
$cls = !empty($displayData['class']) ? " " . str_replace("_", "-", $displayData['class']) : "";
if (!empty($proParams->get('user_avatar'))) {
  $avatar = Uri::base(true) . '/' . $proParams->get('user_avatar');
} else {
  if (file_exists(JPATH_ROOT . "/media/t4/author/default.jpg")) {
    $avatar = Uri::base(true) . '/media/t4/author/default.jpg';
  } else {
    $avatar = "//www.gravatar.com/avatar";
  }
}

use Joomla\CMS\Language\Text;
?>



<div class="author-block<?php echo $cls; ?>">
  <div class="blog-author-name">
    <div class="author-other-info">
      <?php if ($displayData['link']) : ?>
        <div class="author-name"><a href="<?php echo $displayData['author']->link; ?>"><?php echo $displayData['author']->name; ?></a></div>
      <?php else : ?>
        <div class="author-name">
          <h1><?php echo $displayData['author']->name; ?></h1>
        </div>
      <?php endif ?>

      <?php if (!empty($proParams->get('aboutme'))) : ?>
        <p id="intro-text"></p>
      <?php endif ?>

      <?php if (!empty($proParams->get('address1'))) : ?>
        <div class="author-list-info author-address">
          <div class="author-detail-title"><?php echo Text::_('TPL_AUTHOR_DETAIL_ADDRESS'); ?></div>
          <div class="author-address">
            <p><?php echo $proParams->get('address1');  ?></p>
          </div>
        </div>
      <?php endif ?>

      <?php if (!empty($proParams->get('user_jobtitle'))) : ?>
        <div class="author-list-info author-expertise">
          <div class="author-detail-title"><?php echo Text::_('TPL_AUTHOR_DETAIL_EXPERTISE'); ?></div>
          <div class="author-expertise">
            <p><?php echo $proParams->get('user_jobtitle'); ?></p>
          </div>
        </div>
      <?php endif ?>

      <?php
      if ($proParams->get('user_social', '') != "null" && !empty($proParams->get('user_social', ''))) : ?>
        <div class="author-list-info author-social">
          <div class="author-detail-title"><?php echo Text::_('TPL_AUTHOR_DETAIL_SOCIAL'); ?></div>
          <div class="author-socials">
            <?php foreach ($proParams->get('user_social') as $social) : ?>
              <a href="<?php echo $social->social_link; ?>" target="_Blank" title="<?php echo $social->social_name; ?>">
                <span class="<?php echo $social->social_icon; ?>" target="_Blank"><?php echo empty($social->social_icon) ? $social->social_name : ""; ?></span>
              </a>
            <?php endforeach ?>
          </div>
        </div>
      <?php endif ?>
    </div>

    <div class="author-avatar" itemprop="author" itemscope itemtype="https://schema.org/Person">
      <?php if ($author_link) : ?>
        <a href="<?php echo $displayData['author']->link; ?>">
          <img src="<?php echo $avatar; ?>" alt="<?php echo $displayData['author']->name; ?>" />
        </a>
      <?php else : ?>
        <span><img src="<?php echo $avatar; ?>" alt="<?php echo $displayData['author']->name; ?>" /></span>
      <?php endif ?>
    </div>
  </div>

  <?php if (!empty($proParams->get('aboutme'))) : ?>
    <div class="author-about-me">
      <?php echo $proParams->get('aboutme'); ?>
    </div>
    <script>
      document.getElementById('intro-text').innerHTML = document.getElementsByClassName('intro-text')[0].innerHTML;
      document.getElementsByClassName('intro-text')[0].remove();
    </script>
  <?php endif ?>
</div>