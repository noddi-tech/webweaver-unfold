// Shared email domain checking utility for all edge functions

export type EmailDepartment = 'sales' | 'careers' | 'hello';

interface DomainInfo {
  name: string;
  prefix: string;
}

const DOMAIN_PRIORITY: DomainInfo[] = [
  { name: 'info.naviosolutions.com', prefix: 'Navio' },
  { name: 'career.naviosolutions.com', prefix: 'Navio' },
  { name: 'navio.no', prefix: 'Navio' },
];

const DEPARTMENT_EMAILS: Record<EmailDepartment, string> = {
  sales: 'sales',
  careers: 'careers',
  hello: 'hello',
};

const DEPARTMENT_NAMES: Record<EmailDepartment, string> = {
  sales: 'Navio Sales',
  careers: 'Navio Careers',
  hello: 'Navio',
};

/**
 * Get the best verified email address from Resend
 * Checks naviosolutions.com first, then navio.no, then falls back to test domain
 */
export async function getFromAddress(
  apiKey: string, 
  department: EmailDepartment = 'careers'
): Promise<string> {
  const emailUser = DEPARTMENT_EMAILS[department];
  const emailName = DEPARTMENT_NAMES[department];

  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (res.ok) {
      const domains = await res.json();
      
      // Check domains in priority order
      for (const domain of DOMAIN_PRIORITY) {
        const isVerified = domains.data?.some(
          (d: { name: string; status: string }) => 
            d.name === domain.name && d.status === "verified"
        );
        
        if (isVerified) {
          console.log(`Using verified ${domain.name} domain`);
          return `${emailName} <${emailUser}@${domain.name}>`;
        }
      }
    }
  } catch (e) {
    console.log("Domain check failed:", e);
  }

  console.log("Using Resend test domain as fallback");
  return `${emailName} <onboarding@resend.dev>`;
}
