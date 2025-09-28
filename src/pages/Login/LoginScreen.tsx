
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { toast } from '../../components/toast';

const LoginScreen: React.FC<{
  onShowPrivacy: () => void;
}> = ({ onShowPrivacy }) => {
  const history = useHistory();
  const [busy, setBusy] = useState(false);
  // --- NUOVO: Stato per il debug on-screen ---
  const [debugMessages, setDebugMessages] = useState<string[]>([]);

  // --- NUOVO: Funzione per loggare sia su console che su schermo ---
  const log = (message: string) => {
    console.log(message);
    setDebugMessages(prev => [message, ...prev]); // Aggiunge il messaggio in cima alla lista
  };

  const handleGoogleSignIn = async () => {
    setDebugMessages([]); // Pulisce i log precedenti all'inizio
    log('[DEBUG] 1/11: handleGoogleSignIn - Funzione avviata.');

    try {
      log('[DEBUG] 2/11: handleGoogleSignIn - Entrato nel blocco try.');
      
      log('[DEBUG] 3/11: handleGoogleSignIn - Chiamata a setBusy(true).');
      setBusy(true);
      log('[DEBUG] 4/11: handleGoogleSignIn - setBusy(true) completato.');

      log('[DEBUG] 5/11: handleGoogleSignIn - Inizio chiamata a FirebaseAuthentication.signInWithGoogle()...');
      const result = await FirebaseAuthentication.signInWithGoogle();
      log('[DEBUG] 6/11: handleGoogleSignIn - Chiamata a signInWithGoogle() RIUSCITA!');
      log(`[DEBUG] Dati utente: ${JSON.stringify(result, null, 2)}`);

      log('[DEBUG] 7/11: handleGoogleSignIn - Mostro il toast di successo.');
      toast('Login avvenuto con successo!');

      log('[DEBUG] 8/11: handleGoogleSignIn - Reindirizzo alla /home.');
      history.push('/home');

    } catch (error: any) {
      log('-----------------[ERRORE RILEVATO]-----------------');
      log('[DEBUG] 9/11: handleGoogleSignIn - Entrato nel blocco catch.');
      log(`[DEBUG] OGGETTO ERRORE COMPLETO: ${JSON.stringify(error, null, 2)}`);
      
      if (error) {
        log(`[DEBUG] Codice Errore: ${error.code}`);
        log(`[DEBUG] Messaggio Errore: ${error.message}`);
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
      
      log(`[DEBUG] Messaggio per l'utente: ${userMessage}`);
      toast(userMessage);
      log('----------------------------------------------------');

    } finally {
      log('[DEBUG] 10/11: handleGoogleSignIn - Entrato nel blocco finally.');
      
      log('[DEBUG] 11/11: handleGoogleSignIn - Chiamata a setBusy(false).');
      setBusy(false);
      log('[DEBUG] Operazione di login (handleGoogleSignIn) terminata.');
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
        
        {/* --- NUOVO: Area di Debug On-Screen --- */}
        {debugMessages.length > 0 && (
          <IonCard className="ion-margin-top">
            <IonCardHeader>
              <IonCardTitle>Log di Debug</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '200px', overflowY: 'auto' }}>
                {debugMessages.join('\n')}
              </pre>
            </IonCardContent>
          </IonCard>
        )}

      </IonContent>
    </IonPage>
  );
};

export default LoginScreen;
