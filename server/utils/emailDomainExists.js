import axios from "axios";

async function emailDomainExists(email) {
  const domain = email.split("@")[1];
  try {
    const response = await axios.get(
      "https://dns.google/resolve",
      {
        params: {
          name: domain,
          type: "MX"
        }
      }
    );
    return (response.data.Answer?.length ?? 0) > 0;
  } catch(error) {
    console.error(error.message);
    return false;
  }
}

export default emailDomainExists;
