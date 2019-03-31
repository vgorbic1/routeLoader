<div class="login-container">
  <p class="login-message <?php echo $error_message ? "error" : "" ?>"><?php echo $error_message ?? "" ?></p>
  <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" class="login-form" method="post">
    <input type="text" 
          name="username" 
          class="login-form__username"
          placeholder = "username"
          onfocus="this.placeholder=''" 
          onblur="this.placeholder='username'" />
    <input type="password" 
          name="password" 
          class="login-form__password"
          placeholder = "password"
          onfocus="this.placeholder=''" 
          onblur="this.placeholder='password'" />
    <input type="submit" 
          name="submit"
          value="login" 
          class="login-form__submit"
          disabled="true"
           />
  </form>
</div>