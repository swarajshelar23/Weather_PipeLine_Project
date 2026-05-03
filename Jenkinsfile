pipeline {
  agent none
  options {
    timestamps()
  }

  stages {
    stage('Java Build + Run') {
      agent {
        docker { image 'maven:3.9.9-eclipse-temurin-17' }
      }
      steps {
        dir('/workspace/project1-java') {
          sh 'mvn -B clean package'
          sh 'java -ea -jar target/sample-java-1.0-SNAPSHOT.jar'
        }
      }
    }

    stage('Node Install + Test') {
      agent {
        docker { image 'node:20-alpine' }
      }
      steps {
        dir('/workspace/project2-node') {
          sh 'npm ci || npm install'
          sh 'npm test'
        }
      }
    }

    stage('Python Run + Export Report') {
      agent {
        docker { image 'python:3.12-slim' }
      }
      steps {
        dir('/workspace/project3-python') {
          sh 'python app.py'
          sh 'cp /tmp/weather_report.json weather_report.json'
          stash name: 'weather-report', includes: 'weather_report.json'
        }
      }
    }

    stage('Shell Health Check') {
      agent {
        docker { image 'python:3.12-slim' }
      }
      steps {
        dir('/workspace/project4-shell') {
          unstash 'weather-report'
          sh 'cp weather_report.json /tmp/weather_report.json'
          sh 'chmod +x script.sh'
          sh './script.sh'
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
