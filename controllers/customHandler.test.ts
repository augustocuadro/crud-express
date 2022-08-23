import CustomHandler from './customHandler';
import httpMocks from 'node-mocks-http';
import sinon from 'sinon';
import RequestError from '../models/requestError';
import { expect } from 'chai';
import mongoose from 'mongoose';
import NotFoundError from '../models/notFoundError';

describe('when using the CustomHandler', () => {
    describe('and an error is thrown', () => {
        describe('and it is a RequestError', () => {
            it('should return BadRequest', async () => {
                // Given
                const err = new RequestError('An error has occurred');
                const request = httpMocks.createRequest();
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                // When
                await CustomHandler.errorHandler(err, request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(400);
                expect(responseData['message']).to.be.eq(err.message);
            });
        });

        describe('and it is a Mongoose ValidationError', () => {
            it('should return BadRequest', async () => {
                // Given
                const err = new mongoose.Error.ValidationError();
                const request = httpMocks.createRequest();
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                // When
                await CustomHandler.errorHandler(err, request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(400);
                expect(responseData['message']).to.be.eq(err.message);
            });
        });

        describe('and it is a Mongoose CastError', () => {
            it('Should return BadRequest', async () => {
                // Given
                const err = new mongoose.Error.CastError(
                    'string',
                    'Test',
                    'Test'
                );
                const request = httpMocks.createRequest();
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                // When
                await CustomHandler.errorHandler(err, request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(400);
                expect(responseData['message']).to.be.eq(err.message);
            });
        });

        describe('and it is a NotFoundError', () => {
            it('should return NotFound', async () => {
                // Given
                const err = new NotFoundError(
                    'Entity with this ID does not exist'
                );
                const request = httpMocks.createRequest();
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                // When
                await CustomHandler.errorHandler(err, request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(404);
                expect(responseData['message']).to.be.eq(err.message);
            });
        });

        describe('and it is an unhandled type of error', () => {
            it('should return InternalServerError', async () => {
                // Given
                const err = new Error('Some unexpected error has occurred');
                const request = httpMocks.createRequest();
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                // When
                await CustomHandler.errorHandler(err, request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(500);
                expect(responseData['message']).to.be.eq('Unexpected error');
            });
        });
    });

    describe('and a resource could not be found', () => {
        it('should always return NotFound', async () => {
            // Given
            const request = httpMocks.createRequest();
            const response = httpMocks.createResponse();
            const next = sinon.spy();

            // When
            await CustomHandler.notFoundHandler(request, response, next);

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(404);
            expect(responseData['message']).to.be.eq('Resource not found');
        });
    });
});
