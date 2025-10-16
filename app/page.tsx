export default function Home() {
  return (
    <main
      className="min-h-screen w-full bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/wallpaper-home.jpg')",
        backgroundSize: "contain", // 🔹 Mostra a imagem completa, sem cortes
        backgroundColor: "#f0f4f8", // 🔹 Fundo neutro atrás da imagem
      }}
    >
      {/* Camada de leve transparência sobre a imagem */}
      <div className="min-h-screen w-full bg-black/30 flex items-center justify-center">
        <h1 className="text-white text-4xl font-bold drop-shadow-lg text-center px-4">
          Bem-vindo ao Portal Arte&Manha 🎨
        </h1>
      </div>
    </main>
  );
}
