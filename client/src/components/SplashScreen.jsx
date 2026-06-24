import '../styles/SplashScreen.css';

export default function SplashScreen({ isVisible, message = "Logging you in..." }) {
  if (!isVisible) return null;

  return (
    <div className="splash-screen" role="alert" aria-busy="true">
      <div className="splash-screen__content">
        <img 
          src="/logo.jpg" 
          alt="Loading Animation" 
          className="splash-screen__logo" 
        />
        <div className="splash-screen__text">{message}</div>
      </div>
    </div>
  );
}
