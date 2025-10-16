/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔹 Gera site 100% estático (sem Node em produção)
  output: "export",

  // 🔹 Corrige otimização de imagens (desativa necessidade de servidor)
  images: {
    unoptimized: true,
  },

  // 🔹 Garante URLs estáveis (importante para rodar dentro do Spring Boot)
  trailingSlash: true,

  // 🔹 Força basePath vazio (caso o app esteja hospedado na raiz do domínio)
  basePath: "",
};

module.exports = nextConfig;
