
FROM node:24-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
ARG REACT_APP_SOCKET_URL
ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL
COPY frontend/ ./
RUN npm run build


FROM node:24-slim
    
WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
COPY ./backend//create_tables.sh ./
RUN chmod +x ./create_tables.sh
COPY ./backend/database_setup.js ./
COPY --from=frontend-build /app/frontend/build ./client/build

ENV RUN_FRONTEND=true
EXPOSE 3000
EXPOSE 3001
EXPOSE 3002

CMD ["sh", "-c", "./create_tables.sh && npm run start"]
