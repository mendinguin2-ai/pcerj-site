const MAX_LENGTH = 1800;

function clean(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({error: "Método não permitido."})
    };
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL não configurada.");
    return {
      statusCode: 500,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({error: "O envio ainda não foi configurado pelo administrador."})
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({error: "Dados inválidos."})
    };
  }

  const discord = clean(data.discord, 100);
  const personagem = clean(data.personagem, 100);
  const idCidade = clean(data["id-cidade"], 40);
  const idade = clean(data.idade, 10);
  const microfone = clean(data.microfone, 20);
  const experiencia = clean(data.experiencia, 20);
  const corporacao = clean(data["corporacao-anterior"], 150) || "Não informado";
  const codigos = clean(data.codigos, 30);
  const disponibilidade = clean(data.disponibilidade, 50);
  const motivacao = clean(data.motivacao, 900);
  const aceitou = data["aceite-regras"] ? "Sim" : "Não";

  if (!discord || !personagem || !idCidade || !idade || !microfone ||
      !experiencia || !codigos || !disponibilidade || !motivacao || aceitou !== "Sim") {
    return {
      statusCode: 400,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({error: "Preencha todos os campos obrigatórios e aceite as regras."})
    };
  }

  const embed = {
    title: "📋 Nova inscrição — PCERJ",
    description: "Novo candidato para a **PCERJ | Fora do Padrão**.",
    color: 14005343,
    fields: [
      {name: "👤 Discord", value: discord, inline: true},
      {name: "🎮 Personagem", value: personagem, inline: true},
      {name: "🆔 ID na cidade", value: idCidade, inline: true},
      {name: "🎂 Idade", value: idade, inline: true},
      {name: "🎤 Microfone", value: microfone, inline: true},
      {name: "👮 Experiência", value: experiencia, inline: true},
      {name: "🏛️ Corporação anterior", value: corporacao, inline: false},
      {name: "📡 Códigos operacionais", value: codigos, inline: true},
      {name: "⏰ Disponibilidade", value: disponibilidade, inline: true},
      {name: "📝 Motivação", value: motivacao.slice(0, 1024), inline: false},
      {name: "✅ Aceitou as regras", value: aceitou, inline: true}
    ],
    footer: {text: "PCERJ • Fora do Padrão"},
    timestamp: new Date().toISOString()
  };

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username: "PCERJ Inscrições",
        embeds: [embed],
        allowed_mentions: {parse: []}
      })
    });

    if (!discordResponse.ok) {
      const detail = await discordResponse.text();
      console.error("Erro do Discord:", discordResponse.status, detail.slice(0, MAX_LENGTH));
      return {
        statusCode: 502,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({error: "O Discord recusou o envio. Verifique o webhook."})
      };
    }

    return {
      statusCode: 200,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ok: true})
    };
  } catch (error) {
    console.error("Falha ao chamar Discord:", error);
    return {
      statusCode: 500,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({error: "Falha temporária ao enviar. Tente novamente."})
    };
  }
};
