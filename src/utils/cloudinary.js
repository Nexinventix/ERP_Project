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
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const _config_1 = require("@config");
cloudinary_1.v2.config({
    cloud_name: _config_1.CLOUDINARY_CLOUD_NAME,
    api_key: _config_1.CLOUDINARY_API_KEY,
    api_secret: _config_1.CLOUDINARY_API_SECRET
});
const uploadToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.upload(file.path, {
            folder: 'vehicle-certifications',
            resource_type: 'auto'
        });
        return result.secure_url;
    }
    catch (error) {
        throw new Error('Error uploading file to Cloudinary');
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
