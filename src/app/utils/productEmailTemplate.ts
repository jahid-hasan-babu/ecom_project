export const generateLikeEmailHTML = (
  productName: string,
  productDescription: string,
  productImageUrl: string,
) => {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fef5f9;padding:20px;font-family:'Segoe UI',sans-serif;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:30px 40px;text-align:center;">
              <h1 style="color:#d63384;margin-bottom:10px;">💖 You Liked It!</h1>
              <p style="color:#444;font-size:17px;margin-bottom:30px;">
                We're thrilled you liked <strong style="color:#000;">${productName}</strong>! Here's a little reminder of your new favorite find.
              </p>
              <img src="${productImageUrl}" alt="${productName}" width="220" height="220" style="border-radius:12px;margin-bottom:25px;">
              <h2 style="color:#222;margin-bottom:10px;font-size:22px;">${productName}</h2>
              <p style="color:#666;font-size:15px;line-height:1.6;">${productDescription}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;text-align:center;font-size:13px;color:#aaa;">
              <p>&copy; ${new Date().getFullYear()} Your Brand. All rights reserved.</p>
              
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `;
};
