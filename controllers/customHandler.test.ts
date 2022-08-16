import uut from './customHandler';
import httpMocks from "node-mocks-http";
import sinon from "sinon";
import RequestError from "../models/requestError";
import {expect} from "chai";
import mongoose from "mongoose";
import NotFoundError from "../models/notFoundError";

describe('CustomHandler', () => {
    describe('ErrorHandler', () => {
        it('Should return BadRequest when RequestError is thrown', async () => {
            // Given
            const err = new RequestError('An error has occurred');
            const request = httpMocks.createRequest();
            const response = httpMocks.createResponse();
            const next = sinon.spy();

            // When
            await uut.errorHandler(err, request, response, next)

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(400);
            expect(responseData['message']).to.be.eq(err.message);
        });

        it('Should return BadRequest when Mongoose ValidationError is thrown', async () => {
            // Given
            const err = new mongoose.Error.ValidationError();
            const request = httpMocks.createRequest();
            const response = httpMocks.createResponse();
            const next = sinon.spy();

            // When
            await uut.errorHandler(err, request, response, next)

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(400);
            expect(responseData['message']).to.be.eq(err.message);
        });

        it('Should return BadRequest when Mongoose CastError is thrown', async () => {
            // Given
            const err = new mongoose.Error.CastError('string', 'Test', 'Test');
            const request = httpMocks.createRequest();
            const response = httpMocks.createResponse();
            const next = sinon.spy();

            // When
            await uut.errorHandler(err, request, response, next)

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(400);
            expect(responseData['message']).to.be.eq(err.message);
        });

        it('Should return NotFound when NotFoundError is thrown', async () => {
            // Given
            const err = new NotFoundError('Entity with this ID does not exist');
            const request = httpMocks.createRequest();
            const response = httpMocks.createResponse();
            const next = sinon.spy();

            // When
            await uut.errorHandler(err, request, response, next)

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(404);
            expect(responseData['message']).to.be.eq(err.message);
        });

        it('Should return InternalServerError when unhandled type of error is thrown', async () => {
            // Given
            const err = new Error('Some unexpected error has occurred');
            const request = httpMocks.createRequest();
            const response = httpMocks.createResponse();
            const next = sinon.spy();

            // When
            await uut.errorHandler(err, request, response, next)

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(500);
            expect(responseData['message']).to.be.eq('Unexpected error');
        });
    });

    describe('NotFoundHandler', () => {
        it('Should always return NotFound', async () => {
            // Given
            const request = httpMocks.createRequest();
            const response = httpMocks.createResponse();
            const next = sinon.spy();

            // When
            await uut.notFoundHandler(request, response, next);

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(404);
            expect(responseData['message']).to.be.eq('Resource not found');
        });
    });
});