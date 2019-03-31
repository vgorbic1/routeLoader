<a href="logout.php" title="log out"><button class="btn-log-out"></button></a>
<p class="login-message <?php echo $error_message ? "error" : "hidden" ?>"><?php echo $error_message ?? "" ?></p>
<section id="dashboard">
  <article class="general-info">
    <p class="general-info__name">Hello, <?php echo $first_name ?? "" ?></p>
  </article>
  <article class="load-routes">
    <a href="loader.php"><button class="load-routes__btn">load routes</button></a>
  </article>
  <article class="create-template">
    <a href="template.php"><button class="create-template__btn">create template</button></a>
  </article>
  <!-- <article class="view-stats">
    <button class="view-stats__btn">view stats</button>
  </article>
  <article class="update-profile">
    <button class="update-profile__btn">update profile</button>
  </article> -->
</section>
