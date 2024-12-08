 
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ServiceWorkerStatus } from './componentes/service-worker-status-ui'; 




createRoot(document.getElementById('root'))
.render(
  //<React.StrictMode>
    <App />  
  //</React.StrictMode>, 
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();

serviceWorkerRegistration.register({
    onUpdate: (registration) => {
        registration.waiting.postMessage({type: 'SKIP_WAITING'})
        ServiceWorkerStatus("update-ready");
    },
    onInstallingUpdate: (registration) => {
        ServiceWorkerStatus("installing-update");
    }
});