pipeline {
  agent { label 'built-in' }
  options {
    timestamps()
  }

  stages {
    stage('Java Build + Run') {
      steps {
        dir('workspace/project1-java') {
          sh '''
            docker run --rm -v $WORKSPACE:/workspace -w /workspace/workspace/project1-java \
              maven:3.9.9-eclipse-temurin-17 \
              mvn -B clean package
            docker run --rm -v $WORKSPACE:/workspace -w /workspace/workspace/project1-java \
              maven:3.9.9-eclipse-temurin-17 \
              java -ea -jar target/sample-java-1.0-SNAPSHOT.jar
          '''
        }
      }
    }

    stage('Node Install + Test') {
      steps {
        dir('workspace/project2-node') {
          sh '''
            docker run --rm -v $WORKSPACE:/workspace -w /workspace/workspace/project2-node \
              node:20-alpine \
              sh -c "npm ci || npm install && npm test"
          '''
        }
      }
    }

    stage('Python Run + Export Report') {
      steps {
        dir('workspace/project3-python') {
          sh '''
            docker run --rm -v $WORKSPACE:/workspace -w /workspace/workspace/project3-python \
              python:3.12-slim \
              python app.py
            cp /tmp/weather_report.json weather_report.json
          '''
        }
      }
    }

    stage('Shell Health Check') {
      steps {
        dir('workspace/project4-shell') {
          sh '''
            cp ../project3-python/weather_report.json /tmp/weather_report.json
            chmod +x script.sh
            docker run --rm -v $WORKSPACE:/workspace -w /workspace/workspace/project4-shell \
              python:3.12-slim \
              bash script.sh
          '''
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished'
    }
  }
}
