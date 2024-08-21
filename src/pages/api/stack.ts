import { NextApiRequest, NextApiResponse } from 'next';
import { StackClient } from "@stackso/js-core";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { address, points } = req.body; // Use req.body for Node.js style request body parsing

      const stack = new StackClient({
        apiKey: process.env.NEXT_PUBLIC_STACK_API_KEY!, // Get API key from env
        pointSystemId: 3129,
      });

      // Check if user exists
      const checkUser = await stack.getPoints(address);
      
      if (checkUser) {
        return res.status(200).json({ message: 'User already exists' });
      }

      // Track the user's points
      await stack.track('repos', {
        account: address,
        points: points,
        uniqueId: address,
      });

      return res.status(200).json({ message: 'User tracked successfully' });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'An error occurred', error });
  }
}
