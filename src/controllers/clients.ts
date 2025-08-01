import { Request, Response } from 'express';
import { Client } from '../models/client';
import { User } from '../models/users';

interface AuthenticatedRequest extends Request {
  user: User;
}

// Create a new client
export async function createClient(req: AuthenticatedRequest, res: Response) {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json({ message: 'Client created successfully', client });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
}

// Get all clients (paginated)
export async function getAllClients(req: AuthenticatedRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const total = await Client.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const clients = await Client.find().skip(skip).limit(limit);
    res.status(200).json({
      data: clients,
      pagination: { total, page, totalPages, limit }
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
}

// Get a single client by ID
export async function getClientById(req: AuthenticatedRequest, res: Response) {
  try {
    const { clientId } = req.params;
    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
}

// Update a client
export async function updateClient(req: AuthenticatedRequest, res: Response) {
  try {
    const { clientId } = req.params;
    const client = await Client.findByIdAndUpdate(clientId, req.body, { new: true });
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.status(200).json({ message: 'Client updated successfully', client });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
}

// Delete a client
export async function deleteClient(req: AuthenticatedRequest, res: Response) {
  try {
    const { clientId } = req.params;
    const client = await Client.findByIdAndDelete(clientId);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
}
