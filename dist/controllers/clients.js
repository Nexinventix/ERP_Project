"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
exports.getAllClients = getAllClients;
exports.getClientById = getClientById;
exports.updateClient = updateClient;
exports.deleteClient = deleteClient;
exports.searchClients = searchClients;
exports.debugClients = debugClients;
const client_1 = require("../models/client");
// Create a new client
function createClient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = new client_1.Client(req.body);
            yield client.save();
            res.status(201).json({ message: 'Client created successfully', client });
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
        }
    });
}
// Get all clients (paginated)
function getAllClients(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const total = yield client_1.Client.countDocuments();
            const totalPages = Math.ceil(total / limit);
            const clients = yield client_1.Client.find().skip(skip).limit(limit);
            res.status(200).json({
                data: clients,
                pagination: { total, page, totalPages, limit }
            });
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
        }
    });
}
// Get a single client by ID
function getClientById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { clientId } = req.params;
            const client = yield client_1.Client.findById(clientId);
            if (!client) {
                res.status(404).json({ message: 'Client not found' });
                return;
            }
            res.status(200).json(client);
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
        }
    });
}
// Update a client
function updateClient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { clientId } = req.params;
            const client = yield client_1.Client.findByIdAndUpdate(clientId, req.body, { new: true });
            if (!client) {
                res.status(404).json({ message: 'Client not found' });
                return;
            }
            res.status(200).json({ message: 'Client updated successfully', client });
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
        }
    });
}
// Delete a client
function deleteClient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { clientId } = req.params;
            const client = yield client_1.Client.findByIdAndDelete(clientId);
            if (!client) {
                res.status(404).json({ message: 'Client not found' });
                return;
            }
            res.status(200).json({ message: 'Client deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
        }
    });
}
// Search clients by company name, contact person, or email
function searchClients(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { query, page = 1, limit = 10 } = req.query;
            // Validate query parameter
            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                res.status(400).json({ message: 'Search query is required and must be a non-empty string' });
                return;
            }
            // Pagination parameters
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const skip = (pageNum - 1) * limitNum;
            // Create search query using regex for case-insensitive search
            // Remove quotes if they exist around the query
            const searchQuery = query.trim().replace(/^["']|["']$/g, '');
            const searchRegex = new RegExp(searchQuery, 'i');
            // Build the search filter
            const searchFilter = {
                $or: [
                    { companyName: searchRegex },
                    { contactPerson: searchRegex },
                    { email: searchRegex },
                    { contactPersonEmail: searchRegex }
                ]
            };
            // Debug: Log the search query and filter
            console.log('🔍 Client Search Debug:', {
                originalQuery: query,
                cleanedQuery: searchQuery,
                searchFilter,
                searchRegex: searchRegex.toString()
            });
            // Get total count for pagination
            const total = yield client_1.Client.countDocuments(searchFilter);
            const totalPages = Math.ceil(total / limitNum);
            // Debug: Log the count
            console.log('📊 Client Search Results:', { total, totalPages });
            // Perform the search with pagination
            const clients = yield client_1.Client.find(searchFilter)
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }); // Sort by newest first
            // Debug: Log the found clients
            console.log('🏢 Found Clients:', clients.length);
            if (clients.length > 0) {
                console.log('Sample client:', {
                    companyName: clients[0].companyName,
                    contactPerson: clients[0].contactPerson,
                    email: clients[0].email
                });
            }
            res.status(200).json({
                data: clients,
                pagination: {
                    total,
                    page: pageNum,
                    totalPages,
                    limit: limitNum
                }
            });
            return;
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            return;
        }
    });
}
// Debug method to check all clients in database
function debugClients(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allClients = yield client_1.Client.find().limit(5);
            console.log('🔍 Debug: All clients in database:', allClients.length);
            if (allClients.length > 0) {
                console.log('Sample clients:');
                allClients.forEach((client, index) => {
                    console.log(`${index + 1}. Company: "${client.companyName}", Contact: "${client.contactPerson}", Email: "${client.email}"`);
                });
            }
            res.status(200).json({
                message: 'Debug info logged to console',
                totalClients: allClients.length,
                sampleClients: allClients.map(c => ({
                    companyName: c.companyName,
                    contactPerson: c.contactPerson,
                    email: c.email,
                    phone: c.phone,
                    industry: c.industry
                }))
            });
            return;
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
            return;
        }
    });
}
