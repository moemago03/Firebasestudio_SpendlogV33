
import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonRow,
  IonCol,
  IonButton,
  IonLabel,
  IonInput,
  IonItem,
  IonLoading,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { toast } from '../../components/toast';

const LoginScreen: React.FC<{
  onShowPrivacy: () => void;
}> = ({ onShowPrivacy }) => {
  const history = useHistory();
  const [busy, setBusy] = useState(false);

  const handleGoogleSignIn = async () => {
    console.log('[DEBUG] 1/11: handleGoogleSignIn - Funzione avviata.');

    try {
      console.log('[DEBUG] 2/11: handleGoogleSignIn - Entrato nel blocco try.');
      
      console.log('[DEBUG] 3/11: handleGoogleSignIn - Chiamata a setBusy(true).');
      setBusy(true);
      console.log('[DEBUG] 4/11: handleGoogleSignIn - setBusy(true) completato. La UI dovrebbe mostrare il caricamento.');

      console.log('[DEBUG] 5/11: handleGoogleSignIn - Inizio chiamata a FirebaseAuthentication.signInWithGoogle()...');
      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log('[DEBUG] 6/11: handleGoogleSignIn - Chiamata a signInWithGoogle() RIUSCITA!');
      console.log('[DEBUG] Dati utente ricevuti:', JSON.stringify(result, null, 2));

      console.log('[DEBUG] 7/11: handleGoogleSignIn - Mostro il toast di successo.');
      toast('Login avvenuto con successo!');

      console.log('[DEBUG] 8/11: handleGoogleSignIn - Reindirizzo alla /home.');
      history.push('/home');

    } catch (error: any) {
      console.error('-----------------[ERRORE RILEVATO]-----------------');
      console.error('[DEBUG] 9/11: handleGoogleSignIn - Entrato nel blocco catch. Si è verificato un errore.');
      console.error('[DEBUG] OGGETTO ERRORE COMPLETO:', error);
      
      // Tentativo di estrarre più informazioni possibili dall'oggetto errore
      if (error) {
        console.error('[DEBUG] Codice Errore:', error.code);
        console.error('[DEBUG] Messaggio Errore:', error.message);
        console.error('[DEBUG] Stack Trace:', error.stack);
      }
      
      let userMessage = 'Errore imprevisto durante il login.';
      if (error.message) {
        if (error.message.includes('12501') || error.message.includes('12500')) {
          userMessage = 'Accesso annullato dall\'utente.';
        } else if (error.message.includes('10') || error.message.includes('DEVELOPER_ERROR')) {
           userMessage = 'Errore di configurazione. Controlla la chiave SHA-1 in Firebase.';
        } else if (error.message.includes('network')) {
           userMessage = 'Errore di rete. Controlla la connessione internet.';
        } else {
           userMessage = `Errore: ${error.message}`;
        }
      }
      
      console.error('[DEBUG] Messaggio per l\'utente:', userMessage);
      toast(userMessage);
      console.error('----------------------------------------------------');

    } finally {
      console.log('[DEBUG] 10/11: handleGoogleSignIn - Entrato nel blocco finally.');
      
      console.log('[DEBUG] 11/11: handleGoogleSignIn - Chiamata a setBusy(false).');
      setBusy(false);
      console.log('[DEBUG] Operazione di login (handleGoogleSignIn) terminata.');
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <IonLoading message={"Attendere..."} duration={0} isOpen={busy} />
        <IonRow>
          <IonCol className="ion-text-center">
            <h1>Benvenuto!</h1>
            <p>Accedi per continuare</p>
          </IonCol>
        </IonRow>

        <IonRow className="ion-margin-top">
          <IonCol>
            <IonButton
              expand="block"
              onClick={handleGoogleSignIn}
              disabled={busy}
            >
              Accedi con Google
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="ion-text-center">
            <a href="#" onClick={onShowPrivacy}>
              Privacy Policy
            </a>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default LoginScreen;
