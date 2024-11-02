import reportContentHandler from "./reportContent";
import fetchReportsHandler from "./fetchReports";

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return reportContentHandler(req, res);
    case 'GET':
      return fetchReportsHandler(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}