
package com.spendilog.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthentication;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(FirebaseAuthentication.class);
    super.onCreate(savedInstanceState);
  }
}
